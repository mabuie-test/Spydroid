require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connect = require('./config/db');
const path    = require('path');

const app = express();

// CORS aberto (ou restrinja para seu domínio)
app.use(cors());
app.use(express.json());

// Conecta ao MongoDB
connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB conectado'))
  .catch(e => { console.error(e); process.exit(1); });

// Rotas API
app.use('/api/auth', require('./routes/auth'));
app.use('/api',      require('./routes/data'));

// Servir frontend estático
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (req, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

// Tratamento de erros
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message });
});

// Inicia servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
