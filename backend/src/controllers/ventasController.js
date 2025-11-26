// Controlador de ventas: expone handlers para las rutas Express
const ventasService = require('../services/ventasService');

async function getVentasHoy(req, res) {
  try {
    const result = await ventasService.getVentasHoy();
    res.json({ ventasHoy: result.ventas, totalHoy: result.totalHoy, cantidadHoy: result.cantidadHoy });
  } catch (e) {
    console.error('Error getVentasHoy:', e);
    res.status(500).json({ error: 'Error interno al obtener ventas' });
  }
}

async function getVentasPorRango(req, res) {
  try {
    const { dias, fechaInicio, fechaFin } = req.query;
    
    // Si se proporcionan fechas específicas, usarlas; si no, usar dias
    const diasNum = fechaInicio || fechaFin ? null : (parseInt(dias) || 30);
    const result = await ventasService.getVentasPorRango(diasNum, fechaInicio || null, fechaFin || null);
    res.json({ ventasHoy: result.ventas, totalHoy: result.totalHoy, cantidadHoy: result.cantidadHoy });
  } catch (e) {
    console.error('Error getVentasPorRango:', e);
    res.status(500).json({ error: 'Error interno al obtener ventas por rango' });
  }
}

async function crearVenta(req, res) {
  try {
    const payload = req.body;
    // Permitimos que frontend incluya 'productos' como alias de 'items' (compatibilidad con versión previa)
    if (payload.productos && !payload.items) {
      payload.items = payload.productos.map((p) => ({
        descripcion: p.nombre || p.descripcion,
        cantidad: p.cantidad,
        precio_unitario: p.precio || p.precio_unitario,
      }));
    }

    const created = await ventasService.crearVenta(payload);
    res.status(201).json({ mensaje: 'Venta registrada con éxito', venta: created });
  } catch (e) {
    console.error('Error crearVenta:', e);
    const status = e.status || 500;
    res.status(status).json({ error: e.message || 'Error interno al crear venta' });
  }
}

module.exports = { getVentasHoy, getVentasPorRango, crearVenta };
