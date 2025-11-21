const { PrismaClient } = require("../generated/prisma/index.js");
const prisma = new PrismaClient();

// ======================================================
// OBTENER TODOS LOS GASTOS
// ======================================================
const obtenerGastos = async (req, res) => {
  try {
    const gastos = await prisma.gasto.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(gastos);
  } catch (error) {
    console.error("Error al obtener gastos:", error);
    res.status(500).json({ error: "Error al obtener los gastos" });
  }
};

// ======================================================
// REGISTRAR UN GASTO
// ======================================================
const registrarGasto = async (req, res) => {
  try {
    const { monto, detalle } = req.body;

    if (!monto || !detalle) {
      return res
        .status(400)
        .json({ error: "Faltan campos obligatorios (monto y detalle)" });
    }

    const nuevoGasto = await prisma.gasto.create({
      data: {
        monto: Number(monto),
        detalle,
      },
    });

    res.json(nuevoGasto);
  } catch (error) {
    console.error("Error al crear gasto:", error);
    res.status(500).json({ error: "Error al registrar el gasto" });
  }
};

// ======================================================
// ELIMINAR UN GASTO
// ======================================================
const eliminarGasto = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.gasto.delete({
      where: { id: Number(id) },
    });

    res.json({ mensaje: "Gasto eliminado correctamente" });
  } catch (error) {
    console.error("Error al eliminar gasto:", error);
    res.status(500).json({ error: "Error al eliminar el gasto" });
  }
};

// ======================================================
// ACTUALIZAR UN GASTO
// ======================================================
const actualizarGasto = async (req, res) => {
  try {
    const { id } = req.params;
    const { monto, detalle } = req.body;

    const gastoActualizado = await prisma.gasto.update({
      where: { id: Number(id) },
      data: {
        monto: monto ? Number(monto) : undefined,
        detalle: detalle || undefined,
      },
    });

    res.json(gastoActualizado);
  } catch (error) {
    console.error("Error al actualizar gasto:", error);
    res.status(500).json({ error: "Error al actualizar el gasto" });
  }
};

// ======================================================
// EXPORTAR TODAS LAS FUNCIONES
// ======================================================
module.exports = {
  obtenerGastos,
  registrarGasto,
  eliminarGasto,
  actualizarGasto,
};
