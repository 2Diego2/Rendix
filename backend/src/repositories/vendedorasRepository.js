// Repositorio de vendedoras: operaciones CRUD usando Prisma
const prisma = require('../prismaClient');

async function findAll() {
  return prisma.vendedora.findMany({ orderBy: { nombre: 'asc' } });
}

async function findById(id) {
  return prisma.vendedora.findUnique({ where: { id: Number(id) } });
}

async function create(vendedoraData) {
  return prisma.vendedora.create({ data: vendedoraData });
}

async function update(id, vendedoraData) {
  return prisma.vendedora.update({ where: { id: Number(id) }, data: vendedoraData });
}

// delete: validar ventas asociadas debe hacerse en el servicio
async function del(id) {
  return prisma.vendedora.delete({ where: { id: Number(id) } });
}

// utilidad: contar ventas de una vendedora
async function countVentasByVendedora(id) {
  return prisma.venta.count({ where: { vendedora_id: Number(id) } });
}

// utilidad: contar asistencias de una vendedora
async function countAsistenciasByVendedora(id) {
  return prisma.asistencia.count({ where: { vendedora_id: Number(id) } });
}

// utilidad: contar liquidaciones de una vendedora
async function countLiquidacionesByVendedora(id) {
  return prisma.liquidacion.count({ where: { vendedora_id: Number(id) } });
}

// utilidad: contar ventas de una vendedora en el mes corriente
async function countVentasMesCorriente(id) {
  const ahora = new Date();
  const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
  const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0, 23, 59, 59, 999);
  
  return prisma.venta.count({
    where: {
      vendedora_id: Number(id),
      fecha: {
        gte: inicioMes,
        lte: finMes
      }
    }
  });
}

module.exports = {
  findAll,
  findById,
  create,
  update,
  delete: del,
  countVentasByVendedora,
  countAsistenciasByVendedora,
  countLiquidacionesByVendedora,
  countVentasMesCorriente,
};
