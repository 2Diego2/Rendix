// Middleware de manejo centralizado de errores
// Captura errores lanzados por controladores, validaciones y Prisma
// Nota: no requerimos directamente '@prisma/client' aquí para evitar errores
// de carga si el cliente Prisma no se ha generado aún. Detectamos errores de
// Prisma por sus propiedades (`name`, `code`) en tiempo de ejecución.

function errorHandler(err, req, res, next) {
  // Default
  const status = err.status || 500;
  const response = { ok: false, message: err.message || 'Error interno' };

  // Si es error de validación (nuestro formato), incluir detalles
  if (err.details) {
    response.validation = err.details;
  }

  // Manejar errores de Joi explícitamente si vienen con isJoi
  if (err.isJoi) {
    response.validation = err.details || [];
    return res.status(400).json(response);
  }

  // Manejo básico de errores de Prisma (constraints, etc.)
  if (err instanceof Error && err.name === 'PrismaClientKnownRequestError') {
    // Mapear algunos códigos comunes
    const code = err.code;
    if (code === 'P2002') {
      response.message = 'Violación de unicidad (registro duplicado)';
      response.meta = { target: err.meta && err.meta.target };
      return res.status(400).json(response);
    }
    // otros códigos: dejar 400
    return res.status(400).json(response);
  }

  // Si ya hay un status asignado en el error, usarlo
  if (status && status !== 500) {
    return res.status(status).json(response);
  }

  // Para errores 500, incluir stack en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }
  return res.status(500).json(response);
}

module.exports = errorHandler;
