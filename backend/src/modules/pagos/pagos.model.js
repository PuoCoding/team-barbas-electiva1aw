const mongoose = require('mongoose');

// The Pago schema integrates the block fields directly 
// to keep it flat and compatible with frontend array of blocks.
const pagoSchema = new mongoose.Schema({
  // Block fields
  index: { type: Number, required: true },
  date: { type: Date, default: Date.now, required: true },
  previousHash: { type: String, default: '' },
  hash: { type: String, required: true },
  nonce: { type: Number, default: 0 },
  
  // Data fields (we store them directly for easy querying)
  data: {
    estudiante: { type: String, required: true },
    concepto: { type: String, required: true },
    valor: { type: Number, required: true },
    metodo: { type: String, required: true },
    mes: { type: String, required: true }
  }
});

module.exports = mongoose.model('Pago', pagoSchema);
