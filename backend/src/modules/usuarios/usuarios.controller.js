const usuariosService = require('./usuarios.service');
const { sendSuccess, sendError } = require('../../utils/response.util');

exports.register = async (req, res, next) => {
  try {
    const user = await usuariosService.register(req.body);
    return sendSuccess(res, { user }, 201, 'Usuario registrado');
  } catch (err) {
    return next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const result = await usuariosService.login(req.body);
    return sendSuccess(res, result, 200, result.message || 'Login OK');
  } catch (err) {
    return next(err);
  }
};

exports.verify2FA = async (req, res, next) => {
  try {
    const { userId, code } = req.body;
    const result = await usuariosService.verify2FA(userId, code);
    return sendSuccess(res, result, 200, 'Verificación exitosa');
  } catch (err) {
    return next(err);
  }
};

exports.resend2FA = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const result = await usuariosService.resend2FA(userId);
    return sendSuccess(res, result, 200, result.message);
  } catch (err) {
    return next(err);
  }
};

exports.profile = async (req, res, next) => {
  try {
    const user = await usuariosService.getProfile(req.user.id);
    return sendSuccess(res, { user });
  } catch (err) {
    return next(err);
  }
};
