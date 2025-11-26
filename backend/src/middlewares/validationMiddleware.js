// Middleware para validar requests usando esquemas de Joi
// Uso: validar(schema, 'body') o validar(schema, 'params')

function validar(schema, location = 'body') {
  return (req, res, next) => {
    const data = req[location] || {};
    const { error, value } = schema.validate(data, { abortEarly: false, stripUnknown: true });
    if (error) {
      // Formatear mensajes de error en español
      const detalles = error.details.map(d => ({ path: d.path.join('.'), message: d.message }));
      const err = new Error('Error de validación');
      err.status = 400;
      err.details = detalles;
      return next(err);
    }
    // Reemplazar con valores validados y limpios
    req[location] = value;
    return next();
  };
}

module.exports = { validar };
