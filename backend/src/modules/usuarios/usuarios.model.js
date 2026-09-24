const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const usuarioSchema = new mongoose.Schema(
  {
    nombre: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    rol: {
      type: String,
      enum: ['admin', 'docente', 'padre'],
      default: 'padre',
    },

    // ---- 2FA ----
    twoFactorEnabled: { type: Boolean, default: true },
    twoFactorCode: { type: String, default: null, select: false }, // hash SHA-256
    twoFactorExpires: { type: Date, default: null, select: false },
    twoFactorAttempts: { type: Number, default: 0, select: false },
    twoFactorLastSentAt: { type: Date, default: null, select: false },
  },
  { timestamps: true }
);

usuarioSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

usuarioSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('Usuario', usuarioSchema);