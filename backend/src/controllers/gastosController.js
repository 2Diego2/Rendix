const { PrismaClient } = require("../generated/prisma/index.js");
const prisma = new PrismaClient();
const ExcelJS = require("exceljs");
const { agregarReporte } = require("../utils/reportesStorage");

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
        creado_por: 4 // ID de Diego (admin)
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
    const { dias, fechaInicio, fechaFin } = req.query;

    let whereClause = {};

    // Si se proporcionan fechas específicas, usarlas
    if (fechaInicio || fechaFin) {
      whereClause.fecha = {};
      if (fechaInicio) {
        const inicio = new Date(fechaInicio);
        inicio.setHours(0, 0, 0, 0);
        whereClause.fecha.gte = inicio;
      }
      if (fechaFin) {
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        whereClause.fecha.lte = fin;
      }
    } else {
      // Si no hay fechas, usar el parámetro dias (compatibilidad hacia atrás)
      const diasNum = Number(dias) || 0;
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - diasNum);
      fechaLimite.setHours(0, 0, 0, 0);
      whereClause.fecha = { gte: fechaLimite };
    }

    const gastos = await prisma.gasto.findMany({
      where: whereClause,
      orderBy: { fecha: 'desc' },
      include: { usuario: { select: { nombre: true } } }
    });

    const total = gastos.reduce((acc, g) => acc + Number(g.monto), 0);
    res.json({ gastos, gastosHoy: gastos, total });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Error al obtener gastos por rango' });
  }
};

const createGastos = async (req, res) => {
  // El esquema de validación ya validó los campos básicos
  // Asegurar que tenemos los campos necesarios con valores por defecto
  const { monto, detalle, descripcion, categoria, fecha } = req.body;

  // Usar descripcion o detalle (compatibilidad)
  const descripcionFinal = descripcion || detalle || "Sin detalle";

  // Crear el gasto directamente
  try {
    const nuevoGasto = await prisma.gasto.create({
      data: {
        monto: Number(monto),
        descripcion: descripcionFinal,
        categoria: categoria || "Adicional",
        fecha: fecha ? new Date(fecha) : new Date(),
        periodo: new Date().toISOString().slice(0, 7), // YYYY-MM
        creado_por: 4 // ID de Diego (admin)
      },
    });

    res.json(nuevoGasto);
  } catch (error) {
    console.error("Error al crear gasto:", error);
    res.status(500).json({ error: "Error al registrar el gasto" });
  }
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
    // Obtener parámetros de fecha del query string
    const { fechaInicio, fechaFin } = req.query;

    // Construir filtro de fecha
    const whereClause = {};
    if (fechaInicio || fechaFin) {
      whereClause.fecha = {};
      if (fechaInicio) {
        const inicio = new Date(fechaInicio);
        inicio.setHours(0, 0, 0, 0);
        whereClause.fecha.gte = inicio;
      }
      if (fechaFin) {
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);
        whereClause.fecha.lte = fin;
      }
    }

    const gastos = await prisma.gasto.findMany({
      where: whereClause,
      include: {
        usuario: {
          select: { nombre: true }
        }
      },
      orderBy: { fecha: 'desc' }
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

    // Generar nombre de archivo con fecha
    const fechaStr = new Date().toISOString().split('T')[0];
    let nombreArchivo = `gastos_${fechaStr}.xlsx`;
    if (fechaInicio && fechaFin) {
      nombreArchivo = `gastos_${fechaInicio}_${fechaFin}.xlsx`;
    } else if (fechaInicio) {
      nombreArchivo = `gastos_desde_${fechaInicio}.xlsx`;
    } else if (fechaFin) {
      nombreArchivo = `gastos_hasta_${fechaFin}.xlsx`;
    }

    // Generar buffer del archivo
    const buffer = await workbook.xlsx.writeBuffer();
    const tamañoMB = (buffer.length / 1024 / 1024).toFixed(2) + " MB";

    // Registrar el reporte en el historial
    agregarReporte(
      nombreArchivo,
      'gastos',
      tamañoMB,
      { fechaInicio: fechaInicio || null, fechaFin: fechaFin || null }
    );

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename=${nombreArchivo}`);

    res.send(buffer);
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