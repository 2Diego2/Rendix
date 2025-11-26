// Servicio de asistencias: reglas de negocio y validaciones
const asistenciasRepo = require('../repositories/asistenciasRepository');
const prisma = require('../prismaClient');

/**
 * Registra una asistencia individual
 * - valida que la fecha no sea futura
 * - valida que la vendedora exista
 */
async function registrarAsistencia(asistenciaData) {
  const { vendedora_id, fecha, presente } = asistenciaData;

  if (!vendedora_id) {
    const err = new Error('vendedora_id es requerido');
    err.status = 400;
    throw err;
  }

  // Validar fecha
  const fechaObj = fecha ? new Date(fecha) : new Date();
  const ahora = new Date();
  if (fechaObj > ahora) {
    const err = new Error('La fecha de asistencia no puede ser futura');
    err.status = 400;
    throw err;
  }

  // Verificar existencia de vendedora
  const v = await prisma.vendedora.findUnique({ where: { id: Number(vendedora_id) } });
  if (!v) {
    const err = new Error('Vendedora no encontrada');
    err.status = 400;
    throw err;
  }

  // Normalizar la fecha a UTC midnight para consistencia
  const f = new Date(Date.UTC(fechaObj.getUTCFullYear(), fechaObj.getUTCMonth(), fechaObj.getUTCDate()));

  const created = await asistenciasRepo.create({
    vendedora_id: Number(vendedora_id),
    fecha: f,
    presente: !!presente,
    motivo: asistenciaData.motivo || null,
  });

  return created;
}

/**
 * Obtiene asistencias por periodo (YYYY-MM) y calcula estadísticas
 */
async function obtenerAsistenciasPorPeriodo(vendedoraId, periodo, options = {}) {
  const registros = await asistenciasRepo.findByVendedoraAndPeriodo(vendedoraId, periodo);

  // Opciones: mode = 'calendario' | 'habiles'
  const mode = options.mode || 'calendario';

  // Calcular días del periodo según modo
  const [year, month] = periodo.split('-').map(Number);
  const inicio = new Date(Date.UTC(year, month - 1, 1));
  const fin = new Date(Date.UTC(year, month, 1));

  let diasDelPeriodo = 0;
  if (mode === 'habiles') {
    // Contar solo días hábiles (lunes-viernes)
    for (let d = new Date(inicio); d < fin; d.setUTCDate(d.getUTCDate() + 1)) {
      const dow = d.getUTCDay();
      if (dow !== 0 && dow !== 6) diasDelPeriodo += 1;
    }
  } else {
    // Calendario: todos los días del mes
    diasDelPeriodo = Math.floor((fin - inicio) / (24 * 60 * 60 * 1000));
  }

  const presentes = registros.filter(r => r.presente).length;
  const ausentes = registros.filter(r => !r.presente).length;

  const porcentajePresentismo = diasDelPeriodo > 0 ? Number(((presentes / diasDelPeriodo) * 100).toFixed(2)) : 0;

  return { registros, diasDelPeriodo, presentes, ausentes, porcentajePresentismo };
}

/**
 * Calcula presentismo (porcentaje) para una vendedora y periodo
 */
async function calcularPresentismo(vendedoraId, periodo, options = {}) {
  const stats = await obtenerAsistenciasPorPeriodo(vendedoraId, periodo, options);
  return stats.porcentajePresentismo;
}

/**
 * Registrar asistencias masivas (array de { vendedora_id, fecha, presente, motivo })
 */
async function registrarAsistenciasMasivas(asistenciasData) {
  if (!Array.isArray(asistenciasData) || asistenciasData.length === 0) {
    const err = new Error('Array de asistencias vacío o inválido');
    err.status = 400;
    throw err;
  }

  // Validaciones por elemento: vendedora existe y fecha no futura
  const prepared = [];
  for (const a of asistenciasData) {
    const fechaObj = a.fecha ? new Date(a.fecha) : new Date();
    if (fechaObj > new Date()) {
      const err = new Error('Una de las fechas de asistencia es futura');
      err.status = 400;
      throw err;
    }

    const v = await prisma.vendedora.findUnique({ where: { id: Number(a.vendedora_id) } });
    if (!v) {
      const err = new Error(`Vendedora no encontrada: ${a.vendedora_id}`);
      err.status = 400;
      throw err;
    }

    const f = new Date(Date.UTC(fechaObj.getUTCFullYear(), fechaObj.getUTCMonth(), fechaObj.getUTCDate()));
    prepared.push({ vendedora_id: Number(a.vendedora_id), fecha: f, presente: !!a.presente, motivo: a.motivo || null });
  }

  const created = await asistenciasRepo.bulkCreate(prepared);
  return created;
}

async function actualizarAsistencia(id, datos) {
  // No permitimos fecha futura
  if (datos.fecha && new Date(datos.fecha) > new Date()) {
    const err = new Error('La fecha no puede ser futura');
    err.status = 400;
    throw err;
  }

  const updated = await asistenciasRepo.update(id, datos);
  return updated;
}

module.exports = {
  registrarAsistencia,
  obtenerAsistenciasPorPeriodo,
  calcularPresentismo,
  registrarAsistenciasMasivas,
  actualizarAsistencia,
};
