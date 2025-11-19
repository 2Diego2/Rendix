// Servicio de ventas: lógica de negocio sobre el repositorio
const ventasRepo = require('../repositories/ventasRepository');
const prisma = require('../prismaClient');

/**
 * Obtiene ventas del día de hoy
 */
async function getVentasHoy() {
  const ventas = await ventasRepo.findVentasHoy();

  // Calcular totales y cantidad
  const totalHoy = ventas.reduce((acc, v) => acc + Number(v.total), 0);
  return { ventas, totalHoy, cantidadHoy: ventas.length };
}

/**
 * Obtiene ventas en los últimos `dias` días (incluye hoy)
 */
async function getVentasPorRango(dias = 30) {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const inicio = new Date(hoy);
  inicio.setDate(hoy.getDate() - (dias - 1));
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);

  const ventas = await ventasRepo.findVentasPorRango(inicio, manana);
  const total = ventas.reduce((acc, v) => acc + Number(v.total), 0);
  return { ventas, totalHoy: total, cantidadHoy: ventas.length };
}

/**
 * Crear una venta: valida datos, calcula totales y delega al repositorio
 * ventaData: { vendedora_id, items: [{ descripcion, cantidad, precio_unitario, descuento? }], pagos: [{ metodo_pago, monto, referencia? }], fecha?, hora? }
 */
async function crearVenta(ventaData) {
  // Validaciones básicas
  const { vendedora_id, items = [], pagos = [] } = ventaData;
  if (!items || items.length === 0) {
    const err = new Error('Debe incluir al menos un item en la venta');
    err.status = 400;
    throw err;
  }

  // Verificar existencia de vendedora si se pasó el id
  if (vendedora_id) {
    const v = await prisma.vendedora.findUnique({ where: { id: Number(vendedora_id) } });
    if (!v) {
      const err = new Error('Vendedora no encontrada');
      err.status = 400;
      throw err;
    }
  }

  // Calcular total de items
  const totalItems = items.reduce((acc, it) => {
    const cantidad = Number(it.cantidad) || 0;
    const precio = Number(it.precio_unitario || it.precio || 0);
    const descuento = Number(it.descuento || 0);
    return acc + (cantidad * precio - descuento);
  }, 0);

  const totalPagos = pagos.reduce((acc, p) => acc + Number(p.monto || 0), 0);
  const saldoPendiente = Number((totalItems - totalPagos).toFixed(2));

  // Preparar payload para el repositorio
  const payload = {
    fecha: new Date(),
    hora: new Date(),
    vendedora_id: vendedora_id ? Number(vendedora_id) : null,
    total: totalItems,
    estado: 'finalizada',
    ticket_num: `TKT${Date.now()}`,
    saldo_pendiente: saldoPendiente,
    items: items.map((it) => ({
      descripcion: it.descripcion || it.nombre || 'Item',
      cantidad: Number(it.cantidad) || 0,
      precio_unitario: Number(it.precio_unitario || it.precio || 0),
      descuento: Number(it.descuento || 0),
    })),
    pagos: pagos.map((p) => ({
      metodo_pago: p.metodo_pago || 'efectivo',
      monto: Number(p.monto || 0),
      referencia: p.referencia || null,
    })),
  };

  const created = await ventasRepo.createVenta(payload);
  return created;
}

module.exports = {
  getVentasHoy,
  getVentasPorRango,
  crearVenta,
};
