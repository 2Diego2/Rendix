// Servicio de liquidaciones: cálculo y generación de liquidaciones mensuales
const ventasRepo = require('../repositories/ventasRepository');
const vendedorasRepo = require('../repositories/vendedorasRepository');
const asistenciasService = require('../services/asistenciasService');
const liquidacionesRepo = require('../repositories/liquidacionesRepository');

const prisma = require('../prismaClient');

// Parámetros de política (ajustables por defecto)
const PRESENTISMO_THRESHOLD = 85; 
const PRESENTISMO_BONUS_RATE = 0.10; 

/**
 * Calcula la liquidación de una vendedora para un periodo (YYYY-MM).
 */
async function calcularLiquidacion(vendedoraId, periodo, usuarioId = null, options = {}) {
  // 1. Obtener datos de la vendedora
  const vendedora = await prisma.vendedora.findUnique({ where: { id: Number(vendedoraId) } });
  if (!vendedora) {
    const err = new Error('Vendedora no encontrada');
    err.status = 400;
    throw err;
  }

  const sueldo_base = Number(vendedora.sueldo_base || 0);
  const porcentaje_comision = Number(vendedora.porcentaje_comision || 0);

  // Recuperamos las opciones (esto es clave para que funcione lo que envías desde el front)
  const threshold = typeof options.presentismo_threshold === 'number' ? options.presentismo_threshold : PRESENTISMO_THRESHOLD;
  const bonusRate = typeof options.presentismo_bonus_rate === 'number' ? options.presentismo_bonus_rate : PRESENTISMO_BONUS_RATE;
  const presentismoMode = options.presentismo_mode || 'calendario';

  // 2. Calcular total de ventas en el periodo
  const [year, month] = periodo.split('-').map(Number);
  const inicio = new Date(Date.UTC(year, month - 1, 1));
  const fin = new Date(Date.UTC(year, month, 1));

  const ventas = await ventasRepo.findVentasPorRango(inicio, fin);
  const ventasVendedora = ventas.filter(v => Number(v.vendedora_id) === Number(vendedoraId));
  const totalVentas = ventasVendedora.reduce((acc, v) => acc + Number(v.total || 0), 0);

  // 3. Comisión simple
  const comisiones = Number((totalVentas * (porcentaje_comision / 100)).toFixed(2));

  // 4. Calcular presentismo
  const porcentajePresentismo = await asistenciasService.calcularPresentismo(vendedoraId, periodo, { mode: presentismoMode });

  let presentismo_descuento = 0;
  let bonos = 0;
  
  if (porcentajePresentismo >= threshold) {
    bonos = Number((sueldo_base * bonusRate).toFixed(2));
  } else {
    presentismo_descuento = Number((sueldo_base * bonusRate).toFixed(2));
  }

  const total_pagar = Number((sueldo_base + comisiones + bonos - presentismo_descuento).toFixed(2));

  const liquidacion = {
    vendedora_id: Number(vendedoraId),
    periodo,
    sueldo_base: sueldo_base,
    comisiones: comisiones,
    presentismo_descuento: presentismo_descuento,
    bonos: bonos,
    total_pagar: total_pagar,
    estado: 'generada',
    generado_por: usuarioId ? Number(usuarioId) : null,
  };

  return { liquidacion, meta: { totalVentas, porcentajePresentismo, gastosDeduct: 0 } };
}

/**
 * Genera liquidación para una vendedora y la guarda en la DB.
 * CORREGIDO: Ahora recibe 'options' para pasarlo a calcularLiquidacion
 */
async function generarYGuardar(vendedoraId, periodo, usuarioId, options = {}) {
  const { liquidacion, meta } = await calcularLiquidacion(vendedoraId, periodo, usuarioId, options);
  const created = await liquidacionesRepo.create(liquidacion);
  return { created, meta };
}

/**
 * Genera liquidaciones para todas las vendedoras de un periodo.
 * CORREGIDO: Ahora recibe 'options' desde el controller
 */
async function generarLiquidacionesPeriodo(periodo, usuarioId, options = {}) {
  const vendedoras = await prisma.vendedora.findMany();
  const results = [];
  
  for (const v of vendedoras) {
    try {
        // --- TU LÓGICA CORRECTA DE PREVENCIÓN DE DUPLICADOS ---
        const existentes = await liquidacionesRepo.findByVendedoraAndPeriodo(v.id, periodo);
        
        if (existentes.length > 0) {
          // Si ya existe, agregamos error y saltamos (continue)
          results.push({ vendedora_id: v.id, ok: false, error: 'Liquidación ya existente para este periodo' });
          continue; 
        } 
        
        // Si no existe, generamos (pasando las options)
        const r = await generarYGuardar(v.id, periodo, usuarioId, options);
        results.push({ vendedora_id: v.id, ok: true, detalle: r });
        
    } catch (e) {
      results.push({ vendedora_id: v.id, ok: false, error: e.message });
    }
  }

  return { periodo, total: results.length, results };
}

module.exports = { calcularLiquidacion, generarYGuardar, generarLiquidacionesPeriodo };