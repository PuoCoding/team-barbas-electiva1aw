const express = require('express');
const rateLimit = require('express-rate-limit');
const controller = require('./usuarios.controller');
const { protect } = require('./auth.middleware');

const router = express.Router();

// Rate limiting específico para endpoints sensibles de 2FA
const twoFactorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 20, // 20 requests por ventana por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiadas solicitudes. Intenta más tarde.',
  },
});

const resendLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // reenvíos más restrictivos
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Demasiados reenvíos. Intenta más tarde.',
  },
});

router.post('/register', controller.register);
router.post('/login', controller.login);
router.post('/verify-2fa', twoFactorLimiter, controller.verify2FA);
router.post('/resend-2fa', resendLimiter, controller.resend2FA);
router.get('/profile', protect, controller.profile);

module.exports = router;