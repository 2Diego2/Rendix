// backend/routes/ventas.js
const express = require('express');
const router = express.Router();
const ventasController = require('../controllers/ventasController');

router.get('/hoy', ventasController.getVentasHoy);
router.get('/rango', ventasController.getVentasPorRango);

// --- CAMBIO: Quitamos el validador estricto ---
// Dejamos pasar la petición directo al controlador, que ya sabe manejar "productos" y calcular totales.
router.post('/', ventasController.crearVenta);

module.exports = router;