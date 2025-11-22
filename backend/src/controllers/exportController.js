const ExcelJS = require("exceljs");
const ventasService = require("../services/ventasService");
const XLSX = require("xlsx");
const pool = require("../config/db");
const { agregarReporte } = require("../utils/reportesStorage");

// =========================================
// EXPORTAR VENTAS
// =========================================
async function exportarExcelVentas(req, res) {
  try {
    const { dias, fechaInicio, fechaFin } = req.query;
    let ventas, totalHoy, cantidadHoy;

    // Si se proporcionan fechas específicas, usarlas
    if (fechaInicio || fechaFin) {
      const ventasRepo = require('../repositories/ventasRepository');
      let startDate, endDate;
      
      if (fechaInicio) {
        startDate = new Date(fechaInicio);
        startDate.setHours(0, 0, 0, 0);
      } else {
        // Si no hay fecha inicio, usar hace 30 días
        startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
      }
      
      if (fechaFin) {
        endDate = new Date(fechaFin);
        endDate.setHours(23, 59, 59, 999);
      } else {
        // Si no hay fecha fin, usar hoy
        endDate = new Date();
        endDate.setHours(23, 59, 59, 999);
      }
      
      const ventasData = await ventasRepo.findVentasPorRango(startDate, endDate);
      totalHoy = ventasData.reduce((acc, v) => acc + Number(v.total || 0), 0);
      cantidadHoy = ventasData.length;
      ventas = ventasData;
    } else {
      // Si no hay fechas, usar el parámetro dias (compatibilidad hacia atrás)
      const diasNum = parseInt(dias) || 0;
      const result = diasNum === 0
        ? await ventasService.getVentasHoy()
        : await ventasService.getVentasPorRango(diasNum);
      ventas = result.ventas;
      totalHoy = result.totalHoy;
      cantidadHoy = result.cantidadHoy;
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Ventas");

    sheet.addRow([
      "Fecha",
      "Hora",
      "Ticket",
      "Producto",
      "Cantidad",
      "Precio Unitario",
      "Subtotal",
      "Vendedora",
    ]);

    ventas.forEach((venta) => {
      venta.items.forEach((item) => {
        sheet.addRow([
          venta.fecha,
          venta.hora,
          venta.ticket_num,
          item.descripcion,
          item.cantidad,
          item.precio_unitario,
          item.cantidad * item.precio_unitario,
          venta.vendedora ? venta.vendedora.nombre : "",
        ]);
      });
    });

    // Generar nombre de archivo
    let nombreArchivo = `ventas_${dias === 0 ? "hoy" : `ultimos_${dias}_dias`}.xlsx`;
    if (fechaInicio && fechaFin) {
      nombreArchivo = `ventas_${fechaInicio}_${fechaFin}.xlsx`;
    } else if (fechaInicio) {
      nombreArchivo = `ventas_desde_${fechaInicio}.xlsx`;
    } else if (fechaFin) {
      nombreArchivo = `ventas_hasta_${fechaFin}.xlsx`;
    }
    
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${nombreArchivo}`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    // Calcular tamaño del archivo antes de enviarlo
    const buffer = await workbook.xlsx.writeBuffer();
    const tamañoMB = (buffer.length / 1024 / 1024).toFixed(2) + " MB";

    // Registrar el reporte en el historial
    agregarReporte(
      nombreArchivo,
      'ventas',
      tamañoMB,
      { dias: dias || null, fechaInicio: fechaInicio || null, fechaFin: fechaFin || null }
    );

    res.send(buffer);
    res.end();
  } catch (err) {
    console.error("Error exportar Excel:", err);
    res.status(500).json({ error: "Error al generar Excel" });
  }
}

// =========================================
// EXPORTAR GASTOS
// =========================================
async function exportarExcelGastos(req, res) {
  try {
    const [rows] = await pool.query(`
      SELECT concepto, descripcion, monto, fecha, categoria 
      FROM gastos
      ORDER BY fecha DESC
    `);

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, "Gastos");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    res.setHeader("Content-Disposition", "attachment; filename=gastos.xlsx");
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);
  } catch (err) {
    console.error("Error exportando gastos:", err);
    res.status(500).json({ error: "Error al exportar gastos" });
  }
}

// 👇 **EXPORTAMOS TODO CORRECTO**
module.exports = {
  exportarExcelVentas,
  exportarExcelGastos,
};
