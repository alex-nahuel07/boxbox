const jwt = require('jsonwebtoken');

const SECRET = () => process.env.JWT_SECRET || 'boxbox-dev-secret';

function signToken(user) {
  return jwt.sign({ id: user.id_usuario, email: user.email, rol: user.rol }, SECRET(), { expiresIn: '8h' });
}

// Verifica el token JWT enviado en el header Authorization: Bearer <token>
function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Debe iniciar sesión' });
  try {
    req.user = jwt.verify(token, SECRET());
    next();
  } catch {
    res.status(401).json({ error: 'Sesión inválida o vencida' });
  }
}

// Permite el acceso solo a los roles indicados
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.rol)) return res.status(403).json({ error: 'No tiene permisos para esta acción' });
    next();
  };
}

module.exports = { signToken, requireAuth, requireRole };
