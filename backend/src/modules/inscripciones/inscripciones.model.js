const mongoose = require('mongoose');

const inscripcionSchema = new mongoose.Schema({
  index: { type: Number, required: true },
  date: { type: Date, default: Date.now, required: true },
  previousHash: { type: String, default: '' },
  hash: { type: String, required: true },
  nonce: { type: Number, default: 0 },
  
  data: {
    matricula: { type: String, required: true },
    estudiante: { type: String, required: true },
    acudiente: { type: String, required: true },
    fechaInscripcion: { type: String, required: true }
  }
});

module.exports = mongoose.model('Inscripcion', inscripcionSchema);
