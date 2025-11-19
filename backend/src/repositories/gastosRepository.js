// Repositorio de gastos: encapsula operaciones CRUD sobre la tabla 'gastos' usando Prisma
const prisma = require('../prismaClient');

/**
 * Devuelve los gastos de una fecha específica (Date o string ISO 'YYYY-MM-DD')
 */
async function findByDate(fecha) {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  // Normalizar al inicio del día en UTC y usar comparación entre fechas (evitar shifts por zona horaria)
  const inicioUTC = new Date(Date.UTC(fechaObj.getFullYear(), fechaObj.getMonth(), fechaObj.getDate()));
  const siguiente = new Date(inicioUTC.getTime() + 24 * 60 * 60 * 1000);

  return prisma.gasto.findMany({
    where: { fecha: { gte: inicioUTC, lt: siguiente } },
    orderBy: { fecha: 'desc' }
  });
}

/**
 * Devuelve gastos en el rango [fechaInicio, fechaFin)
 * fechaInicio/fechaFin pueden ser Date o strings.
 */
async function findByDateRange(fechaInicio, fechaFin) {
  const inicio = typeof fechaInicio === 'string' ? new Date(fechaInicio) : fechaInicio;
  const fin = typeof fechaFin === 'string' ? new Date(fechaFin) : fechaFin;
  // Normalizar inicio y fin a medianoche UTC para evitar problemas de zona horaria
  const inicioUTC = new Date(Date.UTC(inicio.getFullYear(), inicio.getMonth(), inicio.getDate()));
  const finUTC = new Date(Date.UTC(fin.getFullYear(), fin.getMonth(), fin.getDate()));

  return prisma.gasto.findMany({
    where: { fecha: { gte: inicioUTC, lt: finUTC } },
    orderBy: { fecha: 'desc' }
  });
}

/**
 * Crea un gasto individual.
 * gastoData: { fecha, monto, categoria, descripcion, comprobante_url, periodo, creado_por }
 */
async function create(gastoData) {
  return prisma.gasto.create({ data: gastoData });
}

/**
 * Inserta múltiples gastos en una transacción.
 * gastosData: array de objetos con los mismos campos que create
 */
async function createMany(gastosData) {
  return prisma.$transaction(
    gastosData.map((g) => prisma.gasto.create({ data: g }))
  );
}

/**
 * Elimina todos los gastos del día indicado (fecha Date o string 'YYYY-MM-DD')
 */
async function deleteByDate(fecha) {
  const fechaObj = typeof fecha === 'string' ? new Date(fecha) : fecha;
  fechaObj.setHours(0,0,0,0);
  const siguiente = new Date(fechaObj);
  siguiente.setDate(fechaObj.getDate() + 1);

  return prisma.gasto.deleteMany({ where: { fecha: { gte: fechaObj, lt: siguiente } } });
}

module.exports = {
  findByDate,
  findByDateRange,
  create,
  createMany,
  deleteByDate,
};
