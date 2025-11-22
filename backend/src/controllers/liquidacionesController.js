const liquidacionesService = require('../services/liquidacionesService');
const prisma = require("../prismaClient");
const ExcelJS = require("exceljs");

async function generarPeriodo(req, res) {
  try {
    const periodo = req.body.periodo; // 'YYYY-MM'
    if (!periodo) {
      return res.status(400).json({ error: 'Periodo (YYYY-MM) requerido en body' });
    }
    const usuarioId = req.user?.id || null;
    // Opciones opcionales: presentismo_threshold, presentismo_bonus_rate, incluir_gastos
    const options = {
      presentismo_threshold: req.body.presentismo_threshold !== undefined ? Number(req.body.presentismo_threshold) : undefined,
      presentismo_bonus_rate: req.body.presentismo_bonus_rate !== undefined ? Number(req.body.presentismo_bonus_rate) : undefined,
      // presentismo_mode: 'habiles' | 'calendario'
      presentismo_mode: req.body.presentismo_mode || undefined,
    };

    const result = await liquidacionesService.generarLiquidacionesPeriodo(periodo, usuarioId, options);
    res.json({ mensaje: 'Liquidaciones generadas', result });
  } catch (e) {
    console.error('Error generarPeriodo liquidaciones:', e);
    res.status(e.status || 500).json({ error: e.message || 'Error al generar liquidaciones' });
  }
}

async function getByVendedoraPeriodo(req, res) {
  try {
    const { vendedoraId, periodo } = req.params;
    const items = await require('../repositories/liquidacionesRepository').findByVendedoraAndPeriodo(vendedoraId, periodo);
    res.json({ liquidaciones: items });
  } catch (e) {
    console.error('Error getByVendedoraPeriodo liquidaciones:', e);
    res.status(500).json({ error: 'Error al obtener liquidaciones' });
  }
}

async function getByPeriodo(req, res) {
  try {
    const periodo = req.query.periodo;
    if (!periodo) {
      // Si no hay periodo, usamos la lógica de obtener todas (Fran)
      return obtenerLiquidaciones(req, res);
    }
    const items = await require('../repositories/liquidacionesRepository').findByPeriodo(periodo);
    res.json({ liquidaciones: items });
  } catch (e) {
    console.error('Error getByPeriodo liquidaciones:', e);
    res.status(500).json({ error: 'Error al obtener liquidaciones' });
  }
}

async function obtenerLiquidaciones(req, res) {
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
}

async function exportarLiquidacionesExcel(req, res) {
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
}

module.exports = { generarPeriodo, getByVendedoraPeriodo, getByPeriodo, obtenerLiquidaciones, exportarLiquidacionesExcel };

