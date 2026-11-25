const jwt = require('jsonwebtoken');

module.exports = function auth(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'No autorizado' });
  }

  try {
    req.user = jwt.verify(authorization.split(' ')[1], process.env.JWT_SECRET || 'fallback_secret');
    next();
  } catch {
    res.status(401).json({ mensaje: 'Token inválido' });
  }
};
