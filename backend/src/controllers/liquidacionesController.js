const liquidacionesService = require('../services/liquidacionesService');

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
    if (!periodo) return res.status(400).json({ error: 'Query param periodo requerido' });
    const items = await require('../repositories/liquidacionesRepository').findByPeriodo(periodo);
    res.json({ liquidaciones: items });
  } catch (e) {
    console.error('Error getByPeriodo liquidaciones:', e);
    res.status(500).json({ error: 'Error al obtener liquidaciones' });
  }
}

module.exports = { generarPeriodo, getByVendedoraPeriodo, getByPeriodo };
