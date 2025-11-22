const ExcelJS = require("exceljs");
const ventasService = require("../services/ventasService");
const XLSX = require("xlsx");
const pool = require("../config/db");

// =========================================
// EXPORTAR VENTAS
// =========================================
async function exportarExcelVentas(req, res) {
  try {
    const dias = parseInt(req.query.dias) || 0;

    const { ventas, totalHoy, cantidadHoy } =
      dias === 0
        ? await ventasService.getVentasHoy()
        : await ventasService.getVentasPorRango(dias);

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

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=ventas_${dias === 0 ? "hoy" : `ultimos_${dias}_dias`}.xlsx`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    await workbook.xlsx.write(res);
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
