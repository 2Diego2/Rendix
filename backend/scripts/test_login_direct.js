/**
 * Script de prueba que llama directamente a authService.login
 * para verificar que la autenticación (Prisma + bcrypt + JWT)
 * funciona sin necesidad de hacer una petición HTTP.
 */
require('dotenv').config();
const authService = require('../src/services/authService');

async function test() {
  try {
    const email = process.env.TEST_EMAIL || 'admin@local';
    const password = process.env.TEST_PASSWORD || 'admin123';
    const result = await authService.login(email, password);
    console.log('Login OK. Resultado:');
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('Error en test_login_direct:', err.message || err);
  }
}

test();
