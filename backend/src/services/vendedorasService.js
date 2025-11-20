// Servicio de vendedoras: validaciones y reglas de negocio
const vendedorasRepo = require('../repositories/vendedorasRepository');

function generarCodigoUnico(nombre) {
  // Genera un código simple basado en nombre + timestamp (asegura unicidad razonable)
  const base = (nombre || 'V').toString().trim().toUpperCase().replace(/\s+/g, '_').slice(0, 10);
  return `${base}_${Date.now().toString().slice(-5)}`;
}

async function getAllVendedoras() {
  return vendedorasRepo.findAll();
}

async function getVendedoraById(id) {
  const v = await vendedorasRepo.findById(id);
  if (!v) {
    const err = new Error('Vendedora no encontrada');
    err.status = 404;
    throw err;
  }
  return v;
}

async function createVendedora(data) {
  // Validaciones básicas
  if (!data.nombre || data.nombre.toString().trim() === '') {
    const err = new Error('El nombre es obligatorio');
    err.status = 400;
    throw err;
  }
  const sueldo = Number(data.sueldo_base || 0);
  const porcentaje = Number(data.porcentaje_comision || 0);
  if (isNaN(sueldo) || sueldo < 0) {
    const err = new Error('sueldo_base debe ser número positivo');
    err.status = 400;
    throw err;
  }
  if (isNaN(porcentaje) || porcentaje < 0) {
    const err = new Error('porcentaje_comision debe ser número positivo');
    err.status = 400;
    throw err;
  }

  const payload = {
    nombre: data.nombre,
    codigo: data.codigo || generarCodigoUnico(data.nombre),
    sueldo_base: sueldo,
    porcentaje_comision: porcentaje,
  };

  return vendedorasRepo.create(payload);
}

async function updateVendedora(id, data) {
  // Validaciones opcionales antes de actualizar
  if (data.sueldo_base !== undefined) {
    const sueldo = Number(data.sueldo_base);
    if (isNaN(sueldo) || sueldo < 0) {
      const err = new Error('sueldo_base debe ser número positivo');
      err.status = 400;
      throw err;
    }
    data.sueldo_base = sueldo;
  }
  if (data.porcentaje_comision !== undefined) {
    const porcentaje = Number(data.porcentaje_comision);
    if (isNaN(porcentaje) || porcentaje < 0) {
      const err = new Error('porcentaje_comision debe ser número positivo');
      err.status = 400;
      throw err;
    }
    data.porcentaje_comision = porcentaje;
  }

  return vendedorasRepo.update(id, data);
}

async function deleteVendedora(id) {
  // Obtener conteos de registros asociados (ventas, asistencias, liquidaciones)
  const [ventas, asistencias, liquidaciones] = await Promise.all([
    vendedorasRepo.countVentasByVendedora(id),
    vendedorasRepo.countAsistenciasByVendedora(id),
    vendedorasRepo.countLiquidacionesByVendedora(id),
  ]);

  // Si existe cualquier asociación, devolver un error detallado con los conteos
  if (ventas > 0 || asistencias > 0 || liquidaciones > 0) {
    const detalles = [];
    detalles.push(`ventas: ${ventas}`);
    detalles.push(`asistencias: ${asistencias}`);
    detalles.push(`liquidaciones: ${liquidaciones}`);
    const msg = `No se puede eliminar la vendedora: existen registros asociados (${detalles.join(', ')}). Limpie o reasigne estos registros antes de eliminar.`;
    const err = new Error(msg);
    err.status = 400;
    throw err;
  }

  return vendedorasRepo.delete(id);
}

module.exports = {
  getAllVendedoras,
  getVendedoraById,
  createVendedora,
  updateVendedora,
  deleteVendedora,
};
