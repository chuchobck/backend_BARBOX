import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const hash = '$2a$10$GEDkaac0tWrpRWq91ju57e00cfnrCk/X4vRK01UJks4AJVNNwYEnq';

async function resetPassword() {
  try {
    await prisma.$executeRaw`UPDATE usuario SET password_hash = ${hash} WHERE usuario = 'admin@barbox.com'`;
    console.log(' Contraseña actualizada correctamente');
    console.log('Usuario: admin@barbox.com');
    console.log('Nueva contraseña: admin123');
  } catch (error) {
    console.error(' Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPassword();
