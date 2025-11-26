// Compatibilidad: exportar Prisma client en lugar de `pg`.
// Algunos módulos pueden requerir `../config/db` — ahora retornan la instancia de Prisma.
const prisma = require('../prismaClient');

async function testConexion() {
  try {
    await prisma.$connect();
    console.log('✅ Conectado a PostgreSQL (Prisma)');
  } catch (err) {
    console.error('❌ Error al conectar a PostgreSQL (Prisma)', err);
  }
}

testConexion();

module.exports = prisma;
