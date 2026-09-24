const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const Usuario = require('./usuarios.model');
const env = require('../../config/env');
const emailService = require('../../utils/email.service');
const { AppError } = require('../../utils/AppError'); // ajusta a tu util existente

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function generateNumericCode() {
  // 6 dígitos, criptográficamente seguro, sin sesgo modular.
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

function signToken(user) {
  return jwt.sign(
    { id: user._id, rol: user.rol, email: user.email },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  );
}

async function register(payload) {
  const exists = await Usuario.findOne({ email: payload.email.toLowerCase() });
  if (exists) throw new AppError('El email ya está registrado', 409);
  const user = await Usuario.create(payload);
  user.password = undefined;
  return user;
}

/**
 * Login paso 1: valida credenciales y dispara envío del código 2FA.
 * NO retorna JWT.
 */
async function login({ email, password }) {
  const user = await Usuario.findOne({ email: email.toLowerCase() }).select(
    '+password'
  );

  // Mensaje genérico para no revelar si el email existe.
  if (!user) throw new AppError('Invalid credentials', 401);

  const ok = await user.comparePassword(password);
  if (!ok) throw new AppError('Invalid credentials', 401);

  if (!user.twoFactorEnabled) {
    // Fallback: si algún día se desactiva 2FA para algún usuario
    const token = signToken(user);
    return { requires2FA: false, token, user };
  }

  const code = generateNumericCode();
  user.twoFactorCode = sha256(code);
  user.twoFactorExpires = new Date(
    Date.now() + env.twoFactor.expiryMinutes * 60 * 1000
  );
  user.twoFactorAttempts = 0;
  user.twoFactorLastSentAt = new Date();
  await user.save();

  // Envío en background (no bloquea la respuesta si SMTP tarda).
  emailService
    .sendVerificationCode(user.email, code, user.nombre)
    .catch((e) => console.error('[2FA] Error enviando código:', e));

  return {
    requires2FA: true,
    userId: user._id,
    expiresInMinutes: env.twoFactor.expiryMinutes,
    message:
      'Te enviamos un código de verificación a tu correo. Expira en 10 minutos.',
  };
}

/**
 * Login paso 2: valida código y entrega JWT.
 */
async function verify2FA(userId, code) {
  if (!userId || !code) throw new AppError('userId y code son requeridos', 400);

  const user = await Usuario.findById(userId).select(
    '+twoFactorCode +twoFactorExpires +twoFactorAttempts +password'
  );
  if (!user) throw new AppError('Usuario no encontrado', 404);

  if (!user.twoFactorCode || !user.twoFactorExpires) {
    throw new AppError(
      'No hay un código activo. Vuelve a iniciar sesión.',
      400
    );
  }

  if (user.twoFactorExpires.getTime() < Date.now()) {
    // Código expirado → limpiar
    user.twoFactorCode = null;
    user.twoFactorExpires = null;
    user.twoFactorAttempts = 0;
    await user.save();
    throw new AppError('El código ha expirado. Solicita uno nuevo.', 410);
  }

  if (user.twoFactorAttempts >= env.twoFactor.maxAttempts) {
    // Invalidar y forzar nuevo login
    user.twoFactorCode = null;
    user.twoFactorExpires = null;
    user.twoFactorAttempts = 0;
    await user.save();
    throw new AppError(
      'Demasiados intentos fallidos. Inicia sesión nuevamente.',
      429
    );
  }

  const incomingHash = sha256(String(code).trim());
  const isMatch = crypto.timingSafeEqual(
    Buffer.from(incomingHash, 'hex'),
    Buffer.from(user.twoFactorCode, 'hex')
  );

  if (!isMatch) {
    user.twoFactorAttempts += 1;
    const remaining = env.twoFactor.maxAttempts - user.twoFactorAttempts;

    if (remaining <= 0) {
      user.twoFactorCode = null;
      user.twoFactorExpires = null;
      user.twoFactorAttempts = 0;
      await user.save();
      throw new AppError(
        'Demasiados intentos fallidos. Inicia sesión nuevamente.',
        429
      );
    }

    await user.save();
    throw new AppError(
      `Código incorrecto. Te quedan ${remaining} intento(s).`,
      401
    );
  }

  // Éxito: limpiar campos 2FA
  user.twoFactorCode = null;
  user.twoFactorExpires = null;
  user.twoFactorAttempts = 0;
  user.twoFactorLastSentAt = null;
  await user.save();

  const token = signToken(user);
  const userSafe = user.toObject();
  delete userSafe.password;
  delete userSafe.twoFactorCode;

  return { user: userSafe, token };
}

/**
 * Reenvío del código (con cooldown anti-abuso).
 */
async function resend2FA(userId) {
  if (!userId) throw new AppError('userId es requerido', 400);

  const user = await Usuario.findById(userId).select(
    '+twoFactorLastSentAt'
  );
  if (!user) throw new AppError('Usuario no encontrado', 404);

  const cooldownMs = env.twoFactor.resendCooldownSeconds * 1000;
  if (
    user.twoFactorLastSentAt &&
    Date.now() - user.twoFactorLastSentAt.getTime() < cooldownMs
  ) {
    const waitSec = Math.ceil(
      (cooldownMs - (Date.now() - user.twoFactorLastSentAt.getTime())) / 1000
    );
    throw new AppError(
      `Espera ${waitSec}s antes de solicitar otro código.`,
      429
    );
  }

  const code = generateNumericCode();
  user.twoFactorCode = sha256(code);
  user.twoFactorExpires = new Date(
    Date.now() + env.twoFactor.expiryMinutes * 60 * 1000
  );
  user.twoFactorAttempts = 0;
  user.twoFactorLastSentAt = new Date();
  await user.save();

  emailService
    .sendVerificationCode(user.email, code, user.nombre)
    .catch((e) => console.error('[2FA] Error reenviando código:', e));

  return {
    message: 'Código reenviado. Revisa tu correo.',
    expiresInMinutes: env.twoFactor.expiryMinutes,
  };
}

async function getProfile(userId) {
  const user = await Usuario.findById(userId);
  if (!user) throw new AppError('Usuario no encontrado', 404);
  return user;
}

module.exports = {
  register,
  login,
  verify2FA,
  resend2FA,
  getProfile,
};