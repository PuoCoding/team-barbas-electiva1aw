const mongoose = require('mongoose');

const usuarioSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  rol: { type: String, enum: ['admin', 'docente', 'padre'], default: 'padre' },
}, { timestamps: true });

module.exports = {
  Usuario: mongoose.model('Usuario', usuarioSchema),
};
