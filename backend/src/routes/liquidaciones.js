const express = require("express");
const router = express.Router();
const { obtenerLiquidaciones, exportarLiquidacionesExcel } = require("../controllers/liquidacionesController");

router.get("/", obtenerLiquidaciones);
router.get("/excel", exportarLiquidacionesExcel);

module.exports = router;