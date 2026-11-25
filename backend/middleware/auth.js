const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authorization = req.headers.authorization;
  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ mensaje: 'No autorizado' });
  }

  try {
    req.user = jwt.verify(
      authorization.split(' ')[1],
      process.env.JWT_SECRET || 'kidszone_clave_super_segura_2026',
    );
    next();
  } catch {
    res.status(401).json({ mensaje: 'Token inválido' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ mensaje: 'Acceso denegado para este rol' });
    }
    next();
  };
}

module.exports = { verifyToken, authorize };
