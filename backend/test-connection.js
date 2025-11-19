// Script de prueba para verificar la conexión a PostgreSQL con Prisma
const { PrismaClient } = require('./src/generated/prisma');

const prisma = new PrismaClient();

async function test() {
  try {
    console.log('🔄 Intentando conectar a PostgreSQL...');
    
    // Probar conexión
    await prisma.$connect();
    console.log('✅ Conectado a PostgreSQL exitosamente');
    
    // Probar consulta simple - contar usuarios
    const usuariosCount = await prisma.usuario.count();
    console.log(`✅ Usuarios encontrados: ${usuariosCount}`);
    
    // Probar consulta simple - contar vendedoras
    const vendedorasCount = await prisma.vendedora.count();
    console.log(`✅ Vendedoras encontradas: ${vendedorasCount}`);
    
    // Probar consulta simple - contar ventas
    const ventasCount = await prisma.venta.count();
    console.log(`✅ Ventas encontradas: ${ventasCount}`);
    
    console.log('\n🎉 ¡Todo está funcionando correctamente!');
    
  } catch (error) {
    console.error('\n❌ Error al conectar:');
    console.error(error.message);
    
    if (error.code === 'P1001') {
      console.error('\n💡 Posibles soluciones:');
      console.error('1. Verifica que PostgreSQL esté corriendo');
      console.error('2. Verifica la DATABASE_URL en tu archivo .env');
      console.error('3. Verifica que la base de datos "Rendix" exista');
    } else if (error.code === 'P2002') {
      console.error('\n💡 Error de constraint único');
    } else if (error.code === 'P2025') {
      console.error('\n💡 Registro no encontrado');
    }
    
  } finally {
    await prisma.$disconnect();
    console.log('\n🔌 Desconectado de PostgreSQL');
  }
}

test();

