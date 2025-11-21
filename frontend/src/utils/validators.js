// Validaciones ligeras en frontend (para formularios)
// Mensajes en español, funciones que retornan { valid: boolean, errors: [] }

export function validarVentaFrontend(payload) {
  const errors = [];
  
  //  Validar Productos
  if (!payload.items || !Array.isArray(payload.items) || payload.items.length === 0) {
    errors.push('La venta debe incluir al menos un producto');
  } else {
    payload.items.forEach((it, idx) => {
      if (!it.nombre || String(it.nombre).trim() === '') errors.push(`Item ${idx + 1}: nombre es obligatorio`);
      // Aquí asegúrate de que validas > 0 si no permites cantidad 0
      if (!Number.isFinite(Number(it.cantidad)) || Number(it.cantidad) <= 0) errors.push(`Item ${idx + 1}: cantidad debe ser mayor a 0`);
      if (!Number.isFinite(Number(it.precio)) || Number(it.precio) < 0) errors.push(`Item ${idx + 1}: precio inválido`);
    });
  }

  // Si es null, undefined o "0", da error.
  if (!payload.vendedora_id || !Number.isInteger(Number(payload.vendedora_id)) || Number(payload.vendedora_id) <= 0) {
    errors.push('Debes seleccionar una vendedora válida');
  }

  return { valid: errors.length === 0, errors };
}

export function validarVendedoraFrontend(payload) {
  const errors = [];
  if (!payload.nombre || String(payload.nombre).trim().length < 2) errors.push('Nombre debe tener al menos 2 caracteres');
  if (payload.sueldo_base === undefined || isNaN(Number(payload.sueldo_base)) || Number(payload.sueldo_base) < 0) errors.push('sueldo_base inválido');
  if (payload.porcentaje_comision === undefined || isNaN(Number(payload.porcentaje_comision)) || Number(payload.porcentaje_comision) < 0) errors.push('porcentaje_comision inválido');
  return { valid: errors.length === 0, errors };
}

export function validarGastoFrontend(payload) {
  const errors = [];
  if (!payload.fecha || !/^\d{4}-\d{2}-\d{2}$/.test(payload.fecha)) errors.push('fecha inválida (YYYY-MM-DD)');
  if (payload.monto === undefined || isNaN(Number(payload.monto)) || Number(payload.monto) < 0) errors.push('monto inválido');
  if (!payload.categoria || String(payload.categoria).trim() === '') errors.push('categoria es obligatoria');
  return { valid: errors.length === 0, errors };
}

export function validarAsistenciaFrontend(payload) {
  const errors = [];
  if (!payload.vendedora_id || !Number.isInteger(Number(payload.vendedora_id))) errors.push('vendedora_id inválido');
  if (!payload.fecha || !/^\d{4}-\d{2}-\d{2}$/.test(payload.fecha)) errors.push('fecha inválida (YYYY-MM-DD)');
  if (typeof payload.presente !== 'boolean') errors.push('presente debe ser booleano');
  return { valid: errors.length === 0, errors };
}

export function validarLiquidacionFrontend(payload) {
  const errors = [];
  if (!payload.periodo || !/^\d{4}-\d{2}$/.test(payload.periodo)) errors.push('Periodo inválido (YYYY-MM)');
  if (payload.presentismo_threshold === undefined || isNaN(Number(payload.presentismo_threshold)) || Number(payload.presentismo_threshold) < 0 || Number(payload.presentismo_threshold) > 100) errors.push('Umbral de presentismo inválido (0-100)');
  if (payload.presentismo_bonus_rate === undefined || isNaN(Number(payload.presentismo_bonus_rate)) || Number(payload.presentismo_bonus_rate) < 0) errors.push('Tasa de bono inválida');
  if (payload.presentismo_mode && !['calendario','habiles'].includes(payload.presentismo_mode)) errors.push('Modo de presentismo inválido');
  return { valid: errors.length === 0, errors };
}

export function validarLoginFrontend(payload) {
  const errors = [];
  if (!payload.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(payload.email)) errors.push('Email inválido');
  if (!payload.password || String(payload.password).length < 6) errors.push('La contraseña debe tener al menos 6 caracteres');
  return { valid: errors.length === 0, errors };
}