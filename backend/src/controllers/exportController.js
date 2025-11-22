const ExcelJS = require("exceljs");
const ventasService = require("../services/ventasService");
const prisma = require("../prismaClient");

// =========================================
// EXPORTAR VENTAS
// =========================================
async function exportarExcelVentas(req, res) {
  try {
    const dias = parseInt(req.query.dias) || 0;

    const { ventas } =
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

    const nombreArchivo = `ventas_${dias === 0 ? "hoy" : `ultimos_${dias}_dias`}.xlsx`;

    // Generar el Excel en buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Registrar en la DB (REPORTE)
    const tamañoMB = (buffer.byteLength / 1024 / 1024).toFixed(2) + " MB";

    await prisma.reporte.create({
      data: {
        nombre: nombreArchivo,
        tipo: "ventas",
        tamaño: tamañoMB,
      }
    });

    // Mandar archivo al navegador
    res.setHeader("Content-Disposition", `attachment; filename=${nombreArchivo}`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);

  } catch (err) {
    console.error("Error exportando ventas:", err);
    res.status(500).json({ error: "Error al generar Excel" });
  }
}

// =========================================
// EXPORTAR GASTOS (delegar a gastosController)
// =========================================
async function exportarExcelGastos(req, res) {
  // Reutilizar la función de gastosController
  const { exportarExcelGastos: exportarGastos } = require("./gastosController");
  return exportarGastos(req, res);
}

// =========================================
// EXPORTAR FUNCIONES
// =========================================
module.exports = {
  exportarExcelVentas,
  exportarExcelGastos,
};