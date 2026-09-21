const UsuariosService = require('./usuarios.service');
const { sendSuccess, sendError } = require('../../utils/response.util');

exports.register = async (req, res, next) => {
  try {
    const user = await UsuariosService.register(req.body);
    return sendSuccess(res, 201, 'User registered successfully', user);
  } catch (err) {
    if (err.message === 'Email is already registered') {
      return sendError(res, 400, err.message);
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, 400, 'Please provide email and password');
    }
    
    const result = await UsuariosService.login(email, password);
    return sendSuccess(res, 200, 'Login successful', result);
  } catch (err) {
    if (err.message === 'Invalid credentials') {
      return sendError(res, 401, err.message);
    }
    next(err);
  }
};

exports.getProfile = async (req, res, next) => {
  try {
    const user = await UsuariosService.getUserById(req.user.id);
    if (!user) return sendError(res, 404, 'User not found');
    
    return sendSuccess(res, 200, 'User profile', user);
  } catch (err) {
    next(err);
  }
};
