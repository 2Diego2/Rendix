/**
 * Script para crear un usuario inicial en la tabla `usuarios`.
 * Uso: desde la carpeta backend ejecutar `node scripts/create_initial_user.js`  fran@arr.ar --- 12345
 * Asegúrate de tener las variables de entorno configuradas en `.env`.
 */
require('dotenv').config();
const prisma = require('../src/prismaClient');
const bcrypt = require('bcrypt');
const readline = require('readline');

async function crearUsuarioInicial() {
  try {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

    const pregunta = (q) => new Promise((resolve) => rl.question(q, resolve));

    const nombre = await pregunta('Nombre del usuario inicial (ej: Admin): ');
    const email = await pregunta('Email (ej: admin@ejemplo.com): ');
    const pass = await pregunta('Password (se mostrará en claro al escribir): ');
    rl.close();

    const password_hash = await bcrypt.hash(pass, 10);

    const usuario = await prisma.usuario.create({
      data: {
        nombre: nombre || 'Admin',
        email: email || 'admin@local',
        password_hash, 
        rol: 'admin',
      },
    });

    console.log('Usuario creado:', { id: usuario.id, email: usuario.email, nombre: usuario.nombre });
    await prisma.$disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error creando usuario inicial:', err.message || err);
    await prisma.$disconnect();
    process.exit(1);
  }
}

crearUsuarioInicial();
