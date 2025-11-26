/**
 * Script no interactivo para crear un usuario inicial usando Prisma.
 * Variables opcionales (si no se pasan, se usan valores por defecto):
 *  - ADMIN_NAME
 *  - ADMIN_EMAIL
 *  - ADMIN_PASSWORD
 *
 * Uso:
 *  node scripts/create_initial_user_noninteractive.js
 *
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const prisma = require('../src/prismaClient');
const bcrypt = require('bcrypt');

async function crearUsuario() {
  const nombre = process.env.ADMIN_NAME || 'Diego';
  const email = process.env.ADMIN_EMAIL || 'diego@gmail.com';
  const password = process.env.ADMIN_PASSWORD || '123456';

  try {
    // Verificar existencia
    const existente = await prisma.usuario.findUnique({ where: { email } });
    if (existente) {
      console.log('Usuario ya existe:', { id: existente.id, email: existente.email });
      await prisma.$disconnect();
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);
    const usuario = await prisma.usuario.create({
      data: {
        nombre,
        email,
        password_hash,
        rol: 'admin',
      },
    });

    console.log('Usuario creado:', { id: usuario.id, email: usuario.email, nombre: usuario.nombre });
  } catch (err) {
    console.error('Error creando usuario inicial (no interactivo):', err);
  } finally {
    await prisma.$disconnect();
  }
}

crearUsuario();
