// Esquemas de validación usando Joi
// Comentarios y nombres en español para facilitar mantenimiento

const Joi = require('joi');

// Esquema para una venta básica (sin items)
// - fecha: YYYY-MM-DD
// - total: número positivo
// - vendedora_id: id numérico de la vendedora (se valida existencia en servicio)
// - ticket_num: opcional
const ventaSchema = Joi.object({
  fecha: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required().messages({ 'string.pattern.base': 'fecha debe tener formato YYYY-MM-DD', 'any.required': 'fecha es obligatoria' }),
  total: Joi.number().precision(2).min(0).required().messages({ 'number.base': 'total debe ser un número' }),
  vendedora_id: Joi.number().integer().positive().required().messages({ 'number.base': 'vendedora_id debe ser número' }),
  ticket_num: Joi.string().allow(null, '').optional(),
  // items: lista de objetos VentaItem
  items: Joi.array().items(Joi.object({
    descripcion: Joi.string().min(1).required(),
    cantidad: Joi.number().integer().min(1).required(),
    precio_unitario: Joi.number().precision(2).min(0).required(),
    descuento: Joi.number().precision(2).min(0).optional().default(0),
  })).min(1).required().messages({ 'array.min': 'Debe incluir al menos un item en la venta' }),
});

// Esquema para un item de venta por separado (si se necesita referenciar)
const ventaItemSchema = Joi.object({
  descripcion: Joi.string().min(1).required(),
  cantidad: Joi.number().integer().min(1).required(),
  precio_unitario: Joi.number().precision(2).min(0).required(),
  descuento: Joi.number().precision(2).min(0).optional().default(0),
});

// Esquema para gasto
const gastoSchema = Joi.object({
  fecha: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  monto: Joi.number().precision(2).min(0).required(),
  categoria: Joi.string().max(100).required(),
  descripcion: Joi.string().allow('', null).optional(),
  periodo: Joi.string().pattern(/^\d{4}-\d{2}$/).required(),
  creado_por: Joi.number().integer().positive().required(),
});

// Esquema para vendedora (create/update)
const vendedoraSchema = Joi.object({
  nombre: Joi.string().min(2).max(100).required(),
  codigo: Joi.string().max(50).optional().allow(null, ''),
  sueldo_base: Joi.number().precision(2).min(0).required(),
  porcentaje_comision: Joi.number().precision(2).min(0).required(),
});

// Esquema para generar liquidaciones por periodo
const liquidacionGenerarSchema = Joi.object({
  periodo: Joi.string().pattern(/^\d{4}-\d{2}$/).required().messages({ 'string.pattern.base': 'Periodo debe tener formato YYYY-MM', 'any.required': 'periodo es obligatorio' }),
  opciones: Joi.object().optional(),
});

// Esquema para asistencia
const asistenciaSchema = Joi.object({
  vendedora_id: Joi.number().integer().positive().required(),
  fecha: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/).required(),
  presente: Joi.boolean().required(),
  motivo: Joi.string().allow(null, '').optional(),
});

// Esquema para pago (pago de venta)
const pagoSchema = Joi.object({
  metodo_pago: Joi.string().valid('efectivo', 'tarjeta', 'transferencia').required(),
  monto: Joi.number().precision(2).min(0).required(),
  referencia: Joi.string().allow(null, '').optional(),
});

module.exports = {
  ventaSchema,
  ventaItemSchema,
  gastoSchema,
  vendedoraSchema,
  liquidacionGenerarSchema,
  asistenciaSchema,
  pagoSchema,
};
