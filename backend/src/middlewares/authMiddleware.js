// Middleware de autenticación JWT
// Extrae el token del header Authorization (Bearer TOKEN), lo verifica
// y añade `req.user` con la información del token para uso en controladores.
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token no proporcionado' });

  const partes = authHeader.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Formato del token inválido' });
  }

  const token = partes[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Adjuntar sólo campos seguros al request
    req.user = { id: payload.id, nombre: payload.nombre, email: payload.email, rol: payload.rol };
    return next();
  } catch (err) {
    console.error('authMiddleware: token inválido', err.message);
    return res.status(403).json({ error: 'Token inválido' });
  }
};
