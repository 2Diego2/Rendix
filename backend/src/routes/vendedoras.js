const express = require('express');
const router = express.Router();
const prisma = require('../prismaClient');

// GET /vendedoras - lista simple de vendedoras (id, nombre)
router.get('/', async (req, res) => {
  try {
    const vendedoras = await prisma.vendedora.findMany({ select: { id: true, nombre: true, codigo: true } });
    res.json(vendedoras);
  } catch (e) {
    console.error('Error al obtener vendedoras:', e);
    res.status(500).json({ error: 'Error interno al obtener vendedoras' });
  }
});

module.exports = router;
