const express = require("express");
const router = express.Router();
const { agregarReporte, obtenerReportes, eliminarReporte } = require("../utils/reportesStorage");

// GET: obtener todos los reportes
router.get("/", (req, res) => {
  try {
    const reportes = obtenerReportes();
    res.json(reportes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener reportes" });
  }
});

// POST: crear un reporte (mantenido para compatibilidad, pero ahora se crea automáticamente al exportar)
router.post("/", (req, res) => {
  const { nombre, tipo, tamaño, filtros } = req.body;
  if (!nombre || !tipo || !tamaño)
    return res.status(400).json({ error: "Faltan datos" });

  try {
    const nuevoReporte = agregarReporte(nombre, tipo, tamaño, filtros || {});
    res.status(201).json(nuevoReporte);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear reporte" });
  }
});

// DELETE: eliminar un reporte
router.delete("/:id", (req, res) => {
  const { id } = req.params;
  try {
    const eliminado = eliminarReporte(id);
    if (eliminado) {
      res.json({ mensaje: "Reporte eliminado" });
    } else {
      res.status(404).json({ error: "Reporte no encontrado" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar reporte" });
  }
});

module.exports = router;
