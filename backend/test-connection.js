const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function test() {
  try {
    // Probar conexión
    await prisma.$connect();
    console.log('✅ Conectado a PostgreSQL');
    
    // Probar consulta simple
    const usuarios = await prisma.usuario.findMany();
    console.log('✅ Usuarios encontrados:', usuarios.length);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

test();