const { PrismaClient } = require("../generated/prisma/index.js");
const prisma = new PrismaClient();
const ExcelJS = require("exceljs");

// ======================================================
// OBTENER TODOS LOS GASTOS
// ======================================================
const obtenerGastos = async (req, res) => {
  try {
    const gastos = await prisma.gasto.findMany({
      orderBy: { fecha: "desc" },
      include: { usuario: { select: { nombre: true } } }
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
    const { monto, detalle, categoria, fecha } = req.body;

    if (!monto) {
      return res.status(400).json({ error: "Faltan campos obligatorios (monto)" });
    }

    const nuevoGasto = await prisma.gasto.create({
      data: {
        monto: Number(monto),
        descripcion: detalle || "Sin detalle",
        categoria: categoria || "Adicional",
        fecha: fecha ? new Date(fecha) : new Date(),
        periodo: new Date().toISOString().slice(0, 7), // YYYY-MM
        creado_por: 1 // TODO: Use req.user.id
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
    const { monto, detalle, categoria, fecha } = req.body;

    const data = {};
    if (monto !== undefined) data.monto = Number(monto);
    if (detalle !== undefined) data.descripcion = detalle;
    if (categoria !== undefined) data.categoria = categoria;
    if (fecha !== undefined) data.fecha = new Date(fecha);

    const gastoActualizado = await prisma.gasto.update({
      where: { id: Number(id) },
      data,
    });

    res.json(gastoActualizado);
  } catch (error) {
    console.error("Error al actualizar gasto:", error);
    res.status(500).json({ error: "Error al actualizar el gasto" });
  }
};

// ======================================================
// MÉTODOS DE DIEGO (HEAD)
// ======================================================

const getGastosHoy = async (req, res) => {
  try {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date();
    fin.setHours(23, 59, 59, 999);

    const gastos = await prisma.gasto.findMany({
      where: {
        fecha: { gte: inicio, lte: fin }
      },
      orderBy: { fecha: 'desc' },
      include: { usuario: { select: { nombre: true } } }
    });

    // Calcular total
    const total = gastos.reduce((acc, g) => acc + Number(g.monto), 0);

    res.json({ gastosHoy: gastos, totalHoy: total });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al obtener gastos de hoy' });
  }
};

const getGastosPorRango = async (req, res) => {
  try {
    const dias = Number(req.query.dias) || 0;
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - dias);
    fechaLimite.setHours(0, 0, 0, 0);

    const gastos = await prisma.gasto.findMany({
      where: {
        fecha: { gte: fechaLimite }
      },
      orderBy: { fecha: 'desc' },
      include: { usuario: { select: { nombre: true } } }
    });

    const total = gastos.reduce((acc, g) => acc + Number(g.monto), 0);
    res.json({ gastos, total });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al obtener gastos por rango' });
  }
};

const createGastos = async (req, res) => {
  return registrarGasto(req, res);
};

const reiniciarGastosHoy = async (req, res) => {
  try {
    const inicio = new Date();
    inicio.setHours(0, 0, 0, 0);
    const fin = new Date();
    fin.setHours(23, 59, 59, 999);

    await prisma.gasto.deleteMany({
      where: {
        fecha: { gte: inicio, lte: fin }
      }
    });

    res.json({ mensaje: 'Gastos de hoy reiniciados' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al reiniciar gastos' });
  }
};

const exportarExcelGastos = async (req, res) => {
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

module.exports = {
  obtenerGastos,
  registrarGasto,
  eliminarGasto,
  actualizarGasto,
  getGastosHoy,
  getGastosPorRango,
  createGastos,
  reiniciarGastosHoy,
  exportarExcelGastos
};