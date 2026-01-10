import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

// En entorno de pruebas, exportar un stub para evitar inicializar Prisma
const prismaForEnv = (() => {
  // Si estamos explícitamente en test, usar stub
  if (process.env.NODE_ENV === 'test') {
    return new Proxy({}, { get() { throw new Error('Prisma está deshabilitado en pruebas.'); } });
  }
  // En otros entornos no-producción, intentar inicializar; si falla, usar stub
  try {
    return globalForPrisma.prisma ?? new PrismaClient({ log: ['error'] });
  } catch (e) {
    if (process.env.NODE_ENV !== 'production') {
      return new Proxy({}, { get() { throw new Error('Prisma no disponible. Evite acceso a DB en pruebas sin generar cliente.'); } });
    }
    throw e;
  }
})();

if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test') {
  globalForPrisma.prisma = prismaForEnv;
}

export const prisma = prismaForEnv;
export default prismaForEnv;
