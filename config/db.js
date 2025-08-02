const mongoose = require('mongoose');

/**
 * Conecta ao MongoDB Atlas.
 * @param {string} uri — string de conexão MongoDB (do .env: process.env.MONGO_URI)
 * @returns {Promise} — resolve quando conectado, rejeita em caso de erro.
 */
module.exports = function connectDB(uri) {
  return mongoose.connect(uri, {
    useNewUrlParser:    true,
    useUnifiedTopology: true
  });
};
