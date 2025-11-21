const express = require("express");
const router = express.Router();
const exportController = require("../controllers/exportController");

// GET /exportar/excel/ventas?dias=30
router.get("/excel/ventas", exportController.exportarExcelVentas);

router.get("/excel/gastos", exportController.exportarExcelGastos);


module.exports = router;