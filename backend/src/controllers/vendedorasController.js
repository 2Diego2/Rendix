// Controlador de vendedoras: handlers HTTP
const vendedorasService = require('../services/vendedorasService');

async function getAll(req, res) {
  try {
    const items = await vendedorasService.getAllVendedoras();
    res.json({ vendedoras: items });
  } catch (e) {
    console.error('Error en getAll vendedoras:', e);
    res.status(500).json({ error: 'Error al obtener vendedoras' });
  }
}

async function getById(req, res) {
  try {
    const id = req.params.id;
    const v = await vendedorasService.getVendedoraById(id);
    res.json({ vendedora: v });
  } catch (e) {
    console.error('Error en getById vendedora:', e);
    res.status(e.status || 500).json({ error: e.message || 'Error al obtener vendedora' });
  }
}

async function create(req, res) {
  try {
    const payload = req.body;
    const created = await vendedorasService.createVendedora(payload);
    res.status(201).json({ mensaje: 'Vendedora creada', vendedora: created });
  } catch (e) {
    console.error('Error en create vendedora:', e);
    res.status(e.status || 500).json({ error: e.message || 'Error al crear vendedora' });
  }
}

async function update(req, res) {
  try {
    const id = req.params.id;
    const payload = req.body;
    const updated = await vendedorasService.updateVendedora(id, payload);
    res.json({ mensaje: 'Vendedora actualizada', vendedora: updated });
  } catch (e) {
    console.error('Error en update vendedora:', e);
    res.status(e.status || 500).json({ error: e.message || 'Error al actualizar vendedora' });
  }
}

async function del(req, res) {
  try {
    const id = req.params.id;
    await vendedorasService.deleteVendedora(id);
    res.json({ mensaje: 'Vendedora eliminada' });
  } catch (e) {
    console.error('Error en delete vendedora:', e);
    res.status(e.status || 500).json({ error: e.message || 'Error al eliminar vendedora' });
  }
}

module.exports = { getAll, getById, create, update, delete: del };
