const mongoose = require('mongoose');

const certificadoSchema = new mongoose.Schema({
  index: { type: Number, required: true },
  date: { type: Date, default: Date.now, required: true },
  previousHash: { type: String, default: '' },
  hash: { type: String, required: true },
  nonce: { type: Number, default: 0 },
  
  data: {
    matricula: { type: String, required: true },
    estudiante: { type: String, required: true },
    tipo: { type: String, required: true },
    fechaEmision: { type: String, required: true }
  }
});

module.exports = mongoose.model('Certificado', certificadoSchema);
