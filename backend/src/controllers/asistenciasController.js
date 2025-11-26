// Controlador de asistencias: expone endpoints HTTP y formatea respuestas
const asistenciasService = require('../services/asistenciasService');

async function getAll(req, res) {
  try {
    // Posible query: ?fecha=YYYY-MM-DD
    const fecha = req.query.fecha;
    if (fecha) {
      const registros = await require('../repositories/asistenciasRepository').findByFecha(fecha);
      return res.json({ registros });
    }

    // Si no hay filtro, devolver vacío o instruir uso de endpoints por vendedora/periodo
    return res.json({ mensaje: 'Usa GET /asistencias/:vendedoraId/:periodo para consultar por periodo' });
  } catch (e) {
    console.error('Error en getAll asistencias:', e);
    res.status(500).json({ error: 'Error al obtener asistencias' });
  }
}

async function getByVendedoraPeriodo(req, res) {
  try {
    const vendedoraId = req.params.vendedoraId;
    const periodo = req.params.periodo; // formato YYYY-MM
    const result = await asistenciasService.obtenerAsistenciasPorPeriodo(vendedoraId, periodo);
    res.json(result);
  } catch (e) {
    console.error('Error en getByVendedoraPeriodo:', e);
    res.status(e.status || 500).json({ error: e.message || 'Error al obtener asistencias por periodo' });
  }
}

async function create(req, res) {
  try {
    const payload = req.body;
    const created = await asistenciasService.registrarAsistencia(payload);
    res.status(201).json({ mensaje: 'Asistencia registrada', asistencia: created });
  } catch (e) {
    console.error('Error en create asistencia:', e);
    res.status(e.status || 500).json({ error: e.message || 'Error al crear asistencia' });
  }
}

async function bulkCreate(req, res) {
  try {
    const payload = req.body; // array
    const created = await asistenciasService.registrarAsistenciasMasivas(payload);
    res.status(201).json({ mensaje: 'Asistencias registradas', createdCount: created.length || created });
  } catch (e) {
    console.error('Error en bulkCreate asistencias:', e);
    res.status(e.status || 500).json({ error: e.message || 'Error al registrar asistencias masivas' });
  }
}

async function update(req, res) {
  try {
    const id = req.params.id;
    const payload = req.body;
    const updated = await asistenciasService.actualizarAsistencia(id, payload);
    res.json({ mensaje: 'Asistencia actualizada', asistencia: updated });
  } catch (e) {
    console.error('Error en update asistencia:', e);
    res.status(e.status || 500).json({ error: e.message || 'Error al actualizar asistencia' });
  }
}

module.exports = { getAll, getByVendedoraPeriodo, create, bulkCreate, update };
