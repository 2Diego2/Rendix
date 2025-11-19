const gastosRepo = require('../repositories/gastosRepository');

/**
 * Obtiene gastos del día actual y calcula totales
 */
async function getGastosHoy() {
  // Usamos la fecha actual
  const hoy = new Date();
  
  // IMPORTANTE: Forzamos la fecha string YYYY-MM-DD local para asegurar coincidencia
  // Esto evita que si son las 23:00 en tu PC y 02:00 en el servidor, busque mal.
  const fechaString = hoy.toLocaleDateString('en-CA'); // Formato YYYY-MM-DD local

  // Pasamos el string al repo, que lo convertirá a UTC Start-End correctamente
  const gastos = await gastosRepo.findByDate(fechaString);
  
  const totalHoy = gastos.reduce((acc, g) => acc + Number(g.monto || 0), 0);
  return { gastosHoy: gastos, totalHoy, cantidadHoy: gastos.length };
}

/**
 * Obtiene gastos de los últimos `dias` días
 */
async function getGastosPorRango(dias = 30) {
  const hoy = new Date();
  const fin = new Date(hoy);
  fin.setDate(hoy.getDate() + 1); // Mañana
  
  const inicio = new Date(hoy);
  inicio.setDate(hoy.getDate() - (dias - 1)); // Hace X días

  const gastos = await gastosRepo.findByDateRange(inicio, fin);
  const total = gastos.reduce((acc, g) => acc + Number(g.monto || 0), 0);
  return { gastosHoy: gastos, totalHoy: total, cantidadHoy: gastos.length };
}

/**
 * Crea gastos
 */
async function createGastos(gastosData, usuarioId) {
  if (!Array.isArray(gastosData) || gastosData.length === 0) {
    const err = new Error('El array de gastos no puede estar vacío');
    err.status = 400;
    throw err;
  }

  const prepared = gastosData.map((g) => {
    // Usar la fecha enviada o la de hoy
    const fechaInput = g.fecha ? new Date(g.fecha) : new Date();
    
    // 1. ARREGLO DE CONCEPTO: Unimos concepto y descripción
    // Si existe concepto, lo ponemos al principio de la descripción
    let descripcionFinal = g.descripcion || '';
    if (g.concepto) {
      descripcionFinal = `${g.concepto} - ${descripcionFinal}`;
    }

    const periodo = `${fechaInput.getFullYear()}-${String(fechaInput.getMonth()+1).padStart(2,'0')}`;

    return {
      // 2. ARREGLO DE FECHA: Aseguramos que se guarde a medianoche UTC del día indicado
      fecha: new Date(Date.UTC(fechaInput.getFullYear(), fechaInput.getMonth(), fechaInput.getDate())),
      monto: Number(g.monto || 0),
      categoria: g.categoria || 'Sin categoría',
      descripcion: descripcionFinal, // Guardamos la info unida
      comprobante_url: g.comprobante_url || null,
      periodo,
      creado_por: usuarioId || null,
    };
  });

  const created = await gastosRepo.createMany(prepared);
  return created;
}

async function reiniciarGastosHoy() {
  const hoy = new Date();
  return gastosRepo.deleteByDate(hoy);
}

module.exports = {
  getGastosHoy,
  getGastosPorRango,
  createGastos,
  reiniciarGastosHoy,
};