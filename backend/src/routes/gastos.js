// src/routes/gastos.js
const express = require("express");
const router = express.Router();
const gastosController = require('../controllers/gastosController');
const { validar } = require('../middlewares/validationMiddleware');
const { gastoSchema } = require('../utils/validators');
const { exportarExcelGastos } = require("../controllers/gastosController"); // Assuming it's exported there or I need to add it

// Rutas de gastos delegadas al controlador (usa Prisma a través del servicio)
router.get('/hoy', gastosController.getGastosHoy);
router.get('/rango', gastosController.getGastosPorRango);
router.post('/', validar(gastoSchema, 'body'), gastosController.createGastos);
router.delete('/reiniciar', gastosController.reiniciarGastosHoy);

// Rutas de Fran (Remote)
router.get("/exportar/excel", exportarExcelGastos);
router.get("/", gastosController.obtenerGastos);
router.put("/:id", gastosController.actualizarGasto);
router.delete("/:id", gastosController.eliminarGasto);

module.exports = router;
