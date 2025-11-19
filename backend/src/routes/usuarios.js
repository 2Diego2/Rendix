const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// Obtener todos los usuarios (usando Prisma)
router.get('/', async (req, res) => {
  try {
    const usuarios = await prisma.usuario.findMany();
    res.json(usuarios);
  } catch (err) {
    console.error('Error en GET /usuarios:', err);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
});

module.exports = router;
