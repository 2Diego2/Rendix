const prisma = require('../prismaClient');

/**
 * Buscar un usuario por su email usando Prisma.
 * Retorna el objeto usuario o null si no existe.
 */
async function findByEmail(email) {
  return await prisma.usuario.findUnique({ where: { email } });
}

/**
 * Crear un nuevo usuario (password_hash ya hasheado).
 * Devuelve el usuario creado.
 */
async function create({ nombre, email, password_hash, rol = 'admin' }) {
  return await prisma.usuario.create({
    data: {
      nombre,
      email,
      password_hash,
      rol,
    },
  });
}

module.exports = { findByEmail, create };
