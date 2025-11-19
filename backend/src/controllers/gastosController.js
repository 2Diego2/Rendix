// Controlador de gastos: handlers HTTP que llaman al servicio de gastos
const gastosService = require('../services/gastosService');

async function getGastosHoy(req, res) {
  try {
    const result = await gastosService.getGastosHoy();
    res.json({ gastosHoy: result.gastosHoy, totalHoy: result.totalHoy, cantidadHoy: result.cantidadHoy });
  } catch (e) {
    console.error('Error en getGastosHoy:', e);
    res.status(500).json({ error: 'Error al obtener gastos del día' });
  }
}

async function getGastosPorRango(req, res) {
  try {
    const dias = parseInt(req.query.dias) || 30;
    const result = await gastosService.getGastosPorRango(dias);
    res.json({ gastosHoy: result.gastosHoy, totalHoy: result.totalHoy, cantidadHoy: result.cantidadHoy });
  } catch (e) {
    console.error('Error en getGastosPorRango:', e);
    res.status(500).json({ error: 'Error al obtener gastos por rango' });
  }
}

async function createGastos(req, res) {
  try {
    const gastos = req.body;
    const usuarioId = req.user?.id || null; // tomado del middleware de autenticación

    const created = await gastosService.createGastos(gastos, usuarioId);
    // Obtener el estado actualizado de los gastos del día para devolverlo
    const updated = await gastosService.getGastosHoy();
    res.status(201).json({ mensaje: 'Gastos creados', created, gastosHoy: updated.gastosHoy, totalHoy: updated.totalHoy, cantidadHoy: updated.cantidadHoy });
  } catch (e) {
    console.error('Error en createGastos:', e);
    const status = e.status || 500;
    res.status(status).json({ error: e.message || 'Error al crear gastos' });
  }
}

async function reiniciarGastosHoy(req, res) {
  try {
    await gastosService.reiniciarGastosHoy();
    res.json({ mensaje: 'Gastos del día reiniciados correctamente.' });
  } catch (e) {
    console.error('Error en reiniciarGastosHoy:', e);
    res.status(500).json({ error: 'Error al reiniciar los gastos del día' });
  }
}

module.exports = { getGastosHoy, getGastosPorRango, createGastos, reiniciarGastosHoy };
