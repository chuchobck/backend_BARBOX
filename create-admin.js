import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createAdminEmployee() {
  try {
    // Crear empleado con rol ADMIN para el usuario admin@barbox.com
    const empleado = await prisma.empleado.create({
      data: {
        id_usuario: 2, // ID del usuario admin@barbox.com
        id_rol: 1, // Rol ADMIN
        cedula: '9999999999',
        nombre1: 'Admin',
        apellido1: 'Total',
        telefono: '0999999999',
        estado: 'ACT'
      }
    });
    
    console.log(' Empleado admin creado exitosamente');
    
    // Verificar el usuario completo
    const usuarioCompleto = await prisma.usuario.findUnique({
      where: { usuario: 'admin@barbox.com' },
      include: {
        empleado: {
          include: { rol: true }
        }
      }
    });
    
    console.log('\n Usuario actualizado con rol ADMIN:');
    console.log(`Usuario: ${usuarioCompleto.usuario}`);
    console.log(`Rol: ${usuarioCompleto.empleado.rol.nombre} (${usuarioCompleto.empleado.rol.codigo})`);
    console.log(`Descripción: ${usuarioCompleto.empleado.rol.descripcion}`);
    console.log('\n Ahora puedes acceder a todas las funciones del sistema!');
  } catch (error) {
    console.error(' Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminEmployee();
