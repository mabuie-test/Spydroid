require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const connect = require('./config/db');
const path    = require('path');

const app = express();
app.use(cors());
app.use(express.json());

connect(process.env.MONGO_URI)
  .then(()=>console.log('MongoDB conectado'))
  .catch(e=>{ console.error(e); process.exit(1); });

app.use('/api/auth', require('./routes/auth'));
app.use('/api',      require('./routes/data'));

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));
app.get('*', (_, res) =>
  res.sendFile(path.join(__dirname, 'public', 'index.html'))
);

app.use((err, _, res, next) => {
  console.error(err);
  res.status(err.status||500).json({ error: err.message });
});

app.listen(process.env.PORT||4000, () =>
  console.log(`Backend rodando na porta ${process.env.PORT||4000}`)
);
