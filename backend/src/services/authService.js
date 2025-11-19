const usuariosRepo = require('../repositories/usuariosRepository');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

/**
 * Inicia sesión con email y password.
 * - Busca el usuario por email
 * - Verifica la contraseña con bcrypt
 * - Genera un token JWT con expiración 24 horas
 * - Retorna { token, usuario } sin el password_hash
 */
async function login(email, password) {
  const usuario = await usuariosRepo.findByEmail(email);
  if (!usuario) {
    const err = new Error('Credenciales inválidas');
    err.type = 'INVALID_CREDENTIALS';
    throw err;
  }

  const contraseñaValida = await bcrypt.compare(password, usuario.password_hash || '');
  if (!contraseñaValida) {
    const err = new Error('Credenciales inválidas');
    err.type = 'INVALID_CREDENTIALS';
    throw err;
  }

  // Payload mínimo en el token
  const payload = {
    id: usuario.id,
    nombre: usuario.nombre,
    email: usuario.email,
    rol: usuario.rol,
  };

  const secret = process.env.JWT_SECRET || 'dev_secret_key';
  const token = jwt.sign(payload, secret, { expiresIn: '24h' });

  // NO devolver password_hash al frontend
  const usuarioSinPassword = { ...usuario };
  delete usuarioSinPassword.password_hash;

  return { token, usuario: usuarioSinPassword };
}

module.exports = { login };
