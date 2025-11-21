const { PrismaClient } = require("../generated/prisma/index.js");
const prisma = new PrismaClient();
import ExcelJS from "exceljs";
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


export const exportarExcelGastos = async (req, res) => {
  try {
    const gastos = await prisma.gasto.findMany({
      include: {
        usuario: {
          select: { nombre: true }
        }
      }
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Gastos");

    worksheet.columns = [
      { header: "ID", key: "id", width: 10 },
      { header: "Fecha", key: "fecha", width: 15 },
      { header: "Monto", key: "monto", width: 15 },
      { header: "Categoría", key: "categoria", width: 20 },
      { header: "Descripción", key: "descripcion", width: 30 },
      { header: "Periodo", key: "periodo", width: 15 },
      { header: "Cargado Por", key: "usuario", width: 25 }
    ];

    gastos.forEach(gasto => {
      worksheet.addRow({
        id: gasto.id,
        fecha: gasto.fecha.toISOString().slice(0, 10),
        monto: gasto.monto.toString(),
        categoria: gasto.categoria,
        descripcion: gasto.descripcion,
        periodo: gasto.periodo,
        usuario: gasto.usuario ? gasto.usuario.nombre : "N/A"
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=gastos.xlsx");

    await workbook.xlsx.write(res);

    res.end();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al exportar Excel" });
  }
};