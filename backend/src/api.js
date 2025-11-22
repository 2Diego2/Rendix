// src/routes/reportes.js
const express = require('express');
const router = express.Router();
const pool = require('../db'); // tu pool de PostgreSQL

// GET: traer todos los reportes
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM reportes ORDER BY fecha_creacion DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener reportes' });
  }
});

// POST: agregar un reporte
router.post('/', async (req, res) => {
  const { nombre, tipo, tamaño } = req.body;
  if (!nombre || !tipo || !tamaño) {
    return res.status(400).json({ error: 'Faltan datos' });
  }
  try {
    const result = await pool.query(
      'INSERT INTO reportes (nombre, tipo, tamaño) VALUES ($1, $2, $3) RETURNING *',
      [nombre, tipo, tamaño]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear reporte' });
  }
});

module.exports = router;
s