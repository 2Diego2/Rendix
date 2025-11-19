// Repositorio de ventas: encapsula consultas a la base de datos usando Prisma
const prisma = require('../prismaClient');

/**
 * Buscar ventas en un rango de fechas (inclusive start, exclusive end)
 * start y end son objetos Date
 */
async function findVentasPorRango(start, end) {
  return prisma.venta.findMany({
    where: {
      fecha: {
        gte: start,
        lt: end,
      },
    },
    include: {
      items: true,
      pagos: true,
      vendedora: true,
    },
    orderBy: { fecha: 'desc' },
  });
}

async function findVentasHoy() {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const mañana = new Date(hoy);
  mañana.setDate(hoy.getDate() + 1);
  return findVentasPorRango(hoy, mañana);
}

async function findById(id) {
  return prisma.venta.findUnique({
    where: { id: Number(id) },
    include: { items: true, pagos: true, vendedora: true },
  });
}

/**
 * Crea una venta con sus items y pagos en una transacción
 * ventaData: { fecha, hora, vendedora_id, total, estado, ticket_num, saldo_pendiente, items:[], pagos:[] }
 */
async function createVenta(ventaData) {
  const { items = [], pagos = [], vendedora_id, ...ventaCamposRest } = ventaData;

  // Usamos transacción para asegurar consistencia
  const result = await prisma.$transaction(async (tx) => {
    const created = await tx.venta.create({
      data: {
        ...ventaCamposRest,
        // conectar vendedora por id si se provee
        ...(vendedora_id ? { vendedora: { connect: { id: Number(vendedora_id) } } } : {}),
        items: { create: items.map((it) => ({
          descripcion: it.descripcion,
          cantidad: Number(it.cantidad),
          precio_unitario: it.precio_unitario,
          descuento: it.descuento || 0,
        })) },
        pagos: { create: pagos.map((p) => ({
          metodo_pago: p.metodo_pago,
          monto: p.monto,
          referencia: p.referencia || null,
        })) },
      },
      include: { items: true, pagos: true, vendedora: true },
    });

    return created;
  });

  return result;
}

module.exports = {
  findVentasHoy,
  findVentasPorRango,
  findById,
  createVenta,
};
