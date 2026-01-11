import prisma from './src/lib/prisma.js';

try {
  console.log('🔧 Limpiando constraints e índices duplicados...\n');
  
  // Eliminar índices duplicados si existen
  const cleanupQueries = [
    `DROP INDEX IF EXISTS "cliente_ruc_cedula_key"`,
    `DROP INDEX IF EXISTS "empleado_cedula_key"`,
    `DROP INDEX IF EXISTS "proveedor_ruc_cedula_key"`,
    `DROP INDEX IF EXISTS "usuario_email_key"`
  ];
  
  for (const query of cleanupQueries) {
    try {
      await prisma.$executeRawUnsafe(query);
      console.log(`✅ ${query}`);
    } catch (err) {
      console.log(`⚠️  ${query} - ${err.message}`);
    }
  }
  
  console.log('\n✅ Limpieza completada');
  
} catch (error) {
  console.error('❌ Error:', error.message);
} finally {
  await prisma.$disconnect();
}
