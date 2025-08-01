require('dotenv').config();
const express = require('express');
const path    = require('path');
const cors    = require('cors');
const connect = require('./config/db');

const app = express();
app.use(cors());
app.use(express.json());

// conectar DB
connect(process.env.MONGO_URI)
  .then(()=>console.log('MongoDB conectado'))
  .catch(e=>{ console.error(e); process.exit(1); });

// rotas
app.use('/api/auth', require('./routes/auth'));
app.use('/api',      require('./routes/data'));

// serve o frontend estático em ../frontend/dist
app.use(express.static(path.join(__dirname, '..', 'frontend', 'dist')));
app.get('*', (_,res)=> {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'dist', 'index.html'));
});

// error handler
app.use((err,_,res,next)=>{
  console.error(err);
  res.status(err.status||500).json({ error: err.message });
});

const PORT = process.env.PORT||4000;
app.listen(PORT, ()=>console.log(`📡 Backend rodando na porta ${PORT}`));
