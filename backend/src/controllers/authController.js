const authService = require('../services/authService');

/**
 * Controlador para login.
 * Recibe `email` y `password` en el body y devuelve { token, usuario }.
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Faltan credenciales (email y password)' });
  }

  try {
    const resultado = await authService.login(email, password);
    return res.json(resultado);
  } catch (err) {
    if (err && err.type === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    console.error('Error en authController.login:', err);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};
