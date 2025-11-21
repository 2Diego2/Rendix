const prisma = require("../prismaClient");
const ExcelJS = require("exceljs");


exports.obtenerLiquidaciones = async (req, res) => {
  try {
    const liquidaciones = await prisma.liquidacion.findMany({
      include: {
        vendedora: {
          select: { nombre: true }
        }
      },
      orderBy: { id: "desc" }
    });

    // Convertimos todos los DECIMAL a números JS
    const parsed = liquidaciones.map(l => ({
      id: l.id,
      empleado: l.vendedora.nombre,
      periodo: l.periodo,
      salarioBase: Number(l.sueldo_base),
      comisiones: Number(l.comisiones),
      bonos: Number(l.bonos ?? 0),
      descuentos: Number(l.presentismo_descuento ?? 0),
      total: Number(l.total_pagar),
    }));

    res.json(parsed);

  } catch (error) {
    console.error("❌ Error obteniendo liquidaciones:", error);
    res.status(500).json({ error: "Error obteniendo liquidaciones" });
  }
};

module.exports.exportarLiquidacionesExcel = async (req, res) => {
  try {
    const liquidaciones = await prisma.liquidacion.findMany({
      include: { vendedora: true }
    });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Liquidaciones");

    // Encabezados
    sheet.addRow([
      "ID",
      "Empleado",
      "Periodo",
      "Sueldo Base",
      "Comisiones",
      "Bonos",
      "Descuentos",
      "Total a Pagar",
      "Estado"
    ]);

    // Estilos opcionales
    sheet.getRow(1).font = { bold: true };

    // Cargar datos
    liquidaciones.forEach((liq) => {
      sheet.addRow([
        liq.id,
        liq.vendedora.nombre,
        liq.periodo,
        liq.sueldo_base.toString(),
        liq.comisiones.toString(),
        liq.bonos?.toString() ?? "0",
        liq.presentismo_descuento?.toString() ?? "0",
        liq.total_pagar.toString(),
        liq.estado,
      ]);
    });

    // Encabezados de descarga
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=liquidaciones.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();

  } catch (error) {
    console.error("❌ Error exportando Excel:", error);
    res.status(500).json({ error: "No se pudo generar el Excel" });
  }
};