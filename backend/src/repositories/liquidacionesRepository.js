// Repositorio de liquidaciones: operaciones sobre la tabla 'liquidaciones' usando Prisma
const prisma = require('../prismaClient');

async function create(liquidacionData) {
  return prisma.liquidacion.create({ data: liquidacionData });
}

async function findByVendedoraAndPeriodo(vendedoraId, periodo) {
  return prisma.liquidacion.findMany({ where: { vendedora_id: Number(vendedoraId), periodo }, include: { vendedora: { select: { id: true, nombre: true } }, pagado_por_usuario: { select: { id: true, nombre: true } } } });
}

async function findByPeriodo(periodo) {
  return prisma.liquidacion.findMany({ where: { periodo }, include: { vendedora: { select: { id: true, nombre: true } }, pagado_por_usuario: { select: { id: true, nombre: true } } } });
}

async function updateEstado(id, estado, pagadoPorId = null) {
  // Si se marca como pagada, registrar quién y cuándo
  if (estado === 'pagada') {
    const data = { estado, pagado_en: new Date() };
    if (pagadoPorId) data.pagado_por = Number(pagadoPorId);
    return prisma.liquidacion.update({ where: { id: Number(id) }, data });
  }
  return prisma.liquidacion.update({ where: { id: Number(id) }, data: { estado, pagado_por: null, pagado_en: null } });
}

module.exports = { create, findByVendedoraAndPeriodo, findByPeriodo, updateEstado };
