// Repositorio de gastos: encapsula operaciones CRUD sobre la tabla 'gastos' usando Prisma
const prisma = require('../prismaClient');

/**
 * Devuelve los gastos de una fecha específica (Date o string ISO 'YYYY-MM-DD')
 */
async function findByDate(fecha) {
  let inicioUTC;
  if (typeof fecha === 'string') {
    // Esperamos formato 'YYYY-MM-DD'
    const parts = fecha.split('-');
    if (parts.length === 3) {
      const [y, m, d] = parts.map(Number);
      inicioUTC = new Date(Date.UTC(y, m - 1, d));
    } else {
      // Fallback: construir Date y tomar componentes UTC
      const f = new Date(fecha);
      inicioUTC = new Date(Date.UTC(f.getUTCFullYear(), f.getUTCMonth(), f.getUTCDate()));
    }
  } else if (fecha instanceof Date) {
    // Tomar la fecha en UTC para evitar shifts por zona horaria
    inicioUTC = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()));
  } else {
    // fallback a hoy UTC
    const now = new Date();
    inicioUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

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
  let inicioUTC;
  let finUTC;

  if (typeof fechaInicio === 'string') {
    const p = fechaInicio.split('-').map(Number);
    if (p.length === 3) inicioUTC = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
    else { const t = new Date(fechaInicio); inicioUTC = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate())); }
  } else if (fechaInicio instanceof Date) {
    inicioUTC = new Date(Date.UTC(fechaInicio.getUTCFullYear(), fechaInicio.getUTCMonth(), fechaInicio.getUTCDate()));
  } else {
    const now = new Date(); inicioUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

  if (typeof fechaFin === 'string') {
    const p = fechaFin.split('-').map(Number);
    if (p.length === 3) finUTC = new Date(Date.UTC(p[0], p[1] - 1, p[2]));
    else { const t = new Date(fechaFin); finUTC = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate())); }
  } else if (fechaFin instanceof Date) {
    finUTC = new Date(Date.UTC(fechaFin.getUTCFullYear(), fechaFin.getUTCMonth(), fechaFin.getUTCDate()));
  } else {
    const now = new Date(); finUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

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
  let inicioUTC;
  if (typeof fecha === 'string') {
    const parts = fecha.split('-').map(Number);
    if (parts.length === 3) inicioUTC = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
    else { const t = new Date(fecha); inicioUTC = new Date(Date.UTC(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate())); }
  } else if (fecha instanceof Date) {
    inicioUTC = new Date(Date.UTC(fecha.getUTCFullYear(), fecha.getUTCMonth(), fecha.getUTCDate()));
  } else {
    const now = new Date(); inicioUTC = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

  const siguiente = new Date(inicioUTC.getTime() + 24 * 60 * 60 * 1000);
  return prisma.gasto.deleteMany({ where: { fecha: { gte: inicioUTC, lt: siguiente } } });
}

module.exports = {
  findByDate,
  findByDateRange,
  create,
  createMany,
  deleteByDate,
};
