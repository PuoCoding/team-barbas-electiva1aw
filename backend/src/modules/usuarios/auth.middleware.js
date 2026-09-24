const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../../config/env');
const { sendError } = require('../../utils/response.util');

exports.protect = (req, res, next) => {
  let token;
  
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return sendError(res, 401, 'Not authorized to access this route');
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return sendError(res, 401, 'Not authorized, token failed');
  }
};

exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) {
      return sendError(res, 403, `User role ${req.user.rol} is not authorized to access this route`);
    }
    next();
  };
};
