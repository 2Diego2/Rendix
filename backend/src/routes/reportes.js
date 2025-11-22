const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");

// GET: obtener todos los reportes
router.get("/", async (req, res) => {
  try {
    const reportes = await prisma.reporte.findMany({
      orderBy: { fechaCreacion: "desc" }
    });
    res.json(reportes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener reportes" });
  }
});

// POST: crear un reporte
router.post("/", async (req, res) => {
  const { nombre, tipo, tamaño } = req.body;
  if (!nombre || !tipo || !tamaño)
    return res.status(400).json({ error: "Faltan datos" });

  try {
    const nuevoReporte = await prisma.reporte.create({
      data: { nombre, tipo, tamaño }
    });
    res.status(201).json(nuevoReporte);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear reporte" });
  }
});

// DELETE: eliminar un reporte
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.reporte.delete({ where: { id: parseInt(id) } });
    res.json({ mensaje: "Reporte eliminado" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al eliminar reporte" });
  }
});

module.exports = router;

