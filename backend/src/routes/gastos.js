const express = require("express");
const router = express.Router();
const gastosController = require("../controllers/gastosController");

// Registrar gasto
router.post("/", gastosController.registrarGasto);

// Obtener todos los gastos
router.get("/", gastosController.obtenerGastos);

// Eliminar un gasto
router.delete("/:id", gastosController.eliminarGasto);

// Actualizar un gasto
router.put("/:id", gastosController.actualizarGasto);

module.exports = router;
