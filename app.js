require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connect = require('./config/db');

const app = express();

// Configura CORS (substitua pela URL do seu front-end se quiser restringir)
app.use(cors({
  origin: 'https://seu-frontend.netlify.app'  // ou simplesmente app.use(cors()) para liberar todas
}));

app.use(express.json());

// Conecta ao MongoDB Atlas
connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB Atlas conectado'))
  .catch(err => {
    console.error('❌ Falha ao conectar MongoDB Atlas:', err.message);
    process.exit(1);
  });

// Rotas de autenticação (registro/login)
app.use('/api/auth', require('./routes/auth'));

// Rotas de dados
app.use('/api', require('./routes/data'));

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message });
});

// Inicia o servidor
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando na porta ${PORT}`);
});
