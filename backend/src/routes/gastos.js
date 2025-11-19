const express = require('express');
const router = express.Router();
const gastosController = require('../controllers/gastosController');

// Rutas de gastos delegadas al controlador (usa Prisma a través del servicio)
router.get('/hoy', gastosController.getGastosHoy);
router.get('/rango', gastosController.getGastosPorRango);
router.post('/', gastosController.createGastos);
router.delete('/reiniciar', gastosController.reiniciarGastosHoy);

module.exports = router;
