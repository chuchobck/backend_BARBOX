import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdminPassword() {
  try {
    console.log('🔐 Restableciendo contraseña de admin@barbox.com...\n');
    
    const usuario = 'admin@barbox.com';
    const nuevaPassword = 'admin123';
    
    // Hash de la nueva contraseña
    const passwordHash = await bcrypt.hash(nuevaPassword, 10);
    
    // Actualizar usuario
    await prisma.usuario.update({
      where: { usuario },
      data: { password_hash: passwordHash }
    });
    
    console.log('✅ Contraseña restablecida exitosamente!');
    console.log('\n📝 Credenciales de acceso:');
    console.log(`   Usuario: ${usuario}`);
    console.log(`   Contraseña: ${nuevaPassword}`);
    console.log('');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword();
