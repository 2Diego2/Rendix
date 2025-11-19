const jwt = require('jsonwebtoken');

/**
 * Middleware que protege rutas mediante JWT.
 * - Extrae el header Authorization (Bearer TOKEN)
 * - Verifica el token y pone `req.user` con el payload
 * - Retorna 401 si no hay token, 403 si el token es inválido
 */
module.exports = (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader) return res.status(401).json({ error: 'Token no proporcionado' });

  const partes = authHeader.split(' ');
  if (partes.length !== 2 || partes[0] !== 'Bearer') {
    return res.status(401).json({ error: 'Formato del token inválido' });
  }

  const token = partes[1];
  const secret = process.env.JWT_SECRET || 'dev_secret_key';

  try {
    const payload = jwt.verify(token, secret);
    // Agregar la información del usuario al request para uso posterior
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(403).json({ error: 'Token inválido' });
  }
};
