const express = require("express");
const prisma = require("../prismaClient");
const { exportarExcelGastos } = require("../controllers/gastosController");

const router = express.Router();

// helpers
const buildPeriodo = (fecha) => {
  const d = fecha ? new Date(fecha) : new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  return `${y}-${m}`;
};

const ensureNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

// =========================================
// EXPORTAR EXCEL
// =========================================
router.get("/exportar/excel", exportarExcelGastos);

// =========================================
// GET: todos los gastos
// =========================================
router.get("/", async (req, res) => {
  try {
    const gastos = await prisma.gasto.findMany({
      orderBy: { fecha: "desc" },
    });
    res.json(gastos);
  } catch (err) {
    console.error("Error obtener todos los gastos", err);
    res.status(500).json({ error: "Error al obtener gastos" });
  }
});

// =========================================
// GET: gastos de hoy
// =========================================
router.get("/hoy", async (req, res) => {
  try {
    const inicioDelDia = new Date();
    inicioDelDia.setHours(0, 0, 0, 0);

    const finDelDia = new Date();
    finDelDia.setHours(23, 59, 59, 999);

    const gastosHoy = await prisma.gasto.findMany({
      where: {
        fecha: {
          gte: inicioDelDia,
          lte: finDelDia,
        },
      },
      orderBy: { fecha: "desc" },
    });

    res.json({ gastosHoy });
  } catch (err) {
    console.error("Error al obtener gastos de hoy", err);
    res.status(500).json({ error: "Error al obtener gastos de hoy" });
  }
});

// =========================================
// POST: crear gasto
// =========================================
router.post("/", async (req, res) => {
  try {
    const { monto, detalle } = req.body;

    if (!monto) return res.status(400).json({ error: "Monto requerido" });

    const fechaActual = new Date();
    const periodo = `${fechaActual.getMonth() + 1}-${fechaActual.getFullYear()}`;

    const nuevoGasto = await prisma.gasto.create({
      data: {
        descripcion: detalle || "Sin detalle",
        monto: parseFloat(monto).toString(),
        categoria: "Adicional",
        fecha: new Date(),
        periodo: periodo,
        creado_por: 1, // TODO: obtener del token JWT cuando esté implementado
      },
    });

    res.json(nuevoGasto);
  } catch (err) {
    console.error("🔥 ERROR REAL AL CREAR GASTO:");
    console.error(err);
    res.status(500).json({ error: "Error al crear gasto" });
  }
});

// =========================================
// PUT: actualizar gasto
// =========================================
router.put("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Id inválido" });

    const data = {};
    if (req.body.monto !== undefined) data.monto = Number(req.body.monto);
    if (req.body.descripcion !== undefined) data.descripcion = req.body.descripcion;
    if (req.body.categoria !== undefined) data.categoria = req.body.categoria;
    if (req.body.fecha !== undefined) {
      data.fecha = new Date(req.body.fecha);
      data.periodo = buildPeriodo(req.body.fecha);
    }

    const gastoActualizado = await prisma.gasto.update({
      where: { id },
      data,
    });

    res.json(gastoActualizado);
  } catch (err) {
    console.error("Error al actualizar gasto", err);
    res.status(500).json({ error: "Error al actualizar gasto" });
  }
});

// =========================================
// DELETE: eliminar gasto
// =========================================
router.delete("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!id) return res.status(400).json({ error: "Id inválido" });

    await prisma.gasto.delete({ where: { id } });
    res.json({ mensaje: "Gasto eliminado" });
  } catch (err) {
    console.error("Error al eliminar gasto", err);
    res.status(500).json({ error: "Error al eliminar gasto" });
  }
});

module.exports = router;
