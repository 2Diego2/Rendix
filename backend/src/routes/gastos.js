const express = require('express');
const router = express.Router();
const gastosController = require('../controllers/gastosController');
const { validar } = require('../middlewares/validationMiddleware');
const { gastoSchema } = require('../utils/validators');

// Rutas de gastos delegadas al controlador (usa Prisma a través del servicio)
router.get('/hoy', gastosController.getGastosHoy);
router.get('/rango', gastosController.getGastosPorRango);
router.post('/', validar(gastoSchema, 'body'), gastosController.createGastos);
router.delete('/reiniciar', gastosController.reiniciarGastosHoy);

module.exports = router;
