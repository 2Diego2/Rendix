// Repositorio de asistencias: operaciones CRUD sobre la tabla 'asistencia' usando Prisma
const prisma = require('../prismaClient');

/**
 * Obtiene asistencias de una vendedora en un periodo (periodo formato 'YYYY-MM')
 * Retorna array de registros y calcula dias presentes/ausentes se puede hacer en servicio
 */
async function findByVendedoraAndPeriodo(vendedoraId, periodo) {
  const [year, month] = periodo.split('-').map(Number);
  const inicio = new Date(Date.UTC(year, month - 1, 1));
  const fin = new Date(Date.UTC(year, month, 1));

  return prisma.asistencia.findMany({
    where: {
      vendedora_id: Number(vendedoraId),
      fecha: { gte: inicio, lt: fin },
    },
    include: {
      vendedora: {
        select: {
          id: true,
          nombre: true,
        }
      }
    },
    orderBy: { fecha: 'asc' },
  });
}


/**
 * Obtiene todas las asistencias de una fecha (Date o string 'YYYY-MM-DD')
 */
async function findByFecha(fecha) {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  const inicio = new Date(Date.UTC(
    fechaObj.getUTCFullYear(),
    fechaObj.getUTCMonth(),
    fechaObj.getUTCDate()
  ));
  const siguiente = new Date(inicio);
  siguiente.setUTCDate(inicio.getUTCDate() + 1);

  return prisma.asistencia.findMany({
    where: { fecha: { gte: inicio, lt: siguiente } },
    include: {
      vendedora: {
        select: {
          id: true,
          nombre: true,
        }
      }
    },
    orderBy: { fecha: 'asc' }
  });
}



/**
 * Crea una asistencia
 * asistenciaData: { vendedora_id, fecha (Date or ISO), presente (boolean), motivo }
 */
async function create(asistenciaData) {
  return prisma.asistencia.create({ data: asistenciaData });
}

/**
 * Actualiza una asistencia por id
 */
async function update(id, asistenciaData) {
  return prisma.asistencia.update({ where: { id: Number(id) }, data: asistenciaData });
}

/**
 * Inserción en bulk (transacción)
 */
async function bulkCreate(asistenciasData) {
  return prisma.$transaction(asistenciasData.map((a) => prisma.asistencia.create({ data: a })));
}

module.exports = {
  findByVendedoraAndPeriodo,
  findByFecha,
  create,
  update,
  bulkCreate,
};
