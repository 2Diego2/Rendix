const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');

// Rutas para ventas (ahora delegadas al controlador que usa Prisma)
router.get('/hoy', ventasController.getVentasHoy);
router.get('/rango', ventasController.getVentasPorRango);
router.post('/', ventasController.crearVenta);

module.exports = router;
