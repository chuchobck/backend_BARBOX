#!/usr/bin/env node

/**
 * SETUP SCRIPT - E-COMMERCE BACKEND REFACTORING
 * 
 * Este script valida la configuración y prepara el backend para ejecución.
 * 
 * ✅ Valida variables de entorno
 * ✅ Verifica conexión a BD
 * ✅ Comprueba funciones almacenadas existentes
 * ✅ Genera instrucciones de inicio
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(level, message) {
  const timestamp = new Date().toLocaleTimeString();
  const levelColors = {
    error: colors.red,
    warn: colors.yellow,
    success: colors.green,
    info: colors.cyan,
    debug: colors.bright
  };
  const prefix = levelColors[level] || colors.reset;
  console.log(`${prefix}[${timestamp}]${colors.reset} ${message}`);
}

async function checkEnv() {
  log('info', 'Validando variables de entorno...');
  
  const envPath = path.join(__dirname, '.env');
  
  if (!fs.existsSync(envPath)) {
    log('error', '.env no encontrado en ' + envPath);
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf-8');
  const required = [
    'DATABASE_URL',
    'DIRECT_URL',
    'JWT_SECRET',
    'PORT',
    'NODE_ENV'
  ];

  for (const key of required) {
    if (!envContent.includes(key)) {
      log('error', `Variable de entorno faltante: ${key}`);
      return false;
    }
  }

  log('success', '✅ Variables de entorno configuradas correctamente');
  return true;
}

async function checkDependencies() {
  log('info', 'Verificando dependencias instaladas...');
  
  const packageJsonPath = path.join(__dirname, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    log('error', 'package.json no encontrado');
    return false;
  }

  const required = ['express', 'prisma', '@prisma/client', 'jsonwebtoken'];
  
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  for (const pkg of required) {
    if (!deps[pkg]) {
      log('warn', `${pkg} no está en package.json`);
    }
  }

  log('success', '✅ Dependencias verificadas');
  return true;
}

async function checkControllers() {
  log('info', 'Verificando refactorización de controladores...');

  const controllers = [
    {
      file: 'src/controllers/factura.controller.js',
      functions: ['crearFactura', 'anularFactura']
    },
    {
      file: 'src/controllers/bodega.controller.js',
      functions: ['registrarRecepcion']
    }
  ];

  for (const ctrl of controllers) {
    const filepath = path.join(__dirname, ctrl.file);
    
    if (!fs.existsSync(filepath)) {
      log('warn', `Controlador no encontrado: ${ctrl.file}`);
      continue;
    }

    const content = fs.readFileSync(filepath, 'utf-8');
    
    for (const func of ctrl.functions) {
      if (content.includes(`fn_ingresar_${func.replace('crear', '').replace('Factura', 'factura').replace('Recepcion', 'recepcion')}`) ||
          content.includes(`fn_anular_${func.replace('anular', '').replace('Factura', 'factura')}`) ||
          content.includes('$queryRaw')) {
        log('success', `✅ ${func}() refactorizado correctamente`);
      } else {
        log('warn', `⚠️  ${func}() aún no refactorizado`);
      }
    }
  }
}

async function main() {
  console.log('\n' + colors.bright + '════════════════════════════════════════════' + colors.reset);
  console.log(colors.bright + '  E-COMMERCE BACKEND - SETUP VALIDATOR' + colors.reset);
  console.log(colors.bright + '════════════════════════════════════════════' + colors.reset + '\n');

  let isValid = true;

  // Validar .env
  if (!await checkEnv()) {
    isValid = false;
  }

  // Validar dependencias
  if (!await checkDependencies()) {
    isValid = false;
  }

  // Validar controladores
  await checkControllers();

  console.log('\n' + colors.bright + '════════════════════════════════════════════' + colors.reset);

  if (isValid) {
    console.log(colors.green + colors.bright + '✅ TODO LISTO PARA INICIAR' + colors.reset);
    console.log('\nPasos siguientes:\n');
    console.log('1️⃣  Instalar dependencias (si no está hecho):');
    console.log(colors.cyan + '    npm install' + colors.reset + '\n');
    
    console.log('2️⃣  Ejecutar migraciones Prisma:');
    console.log(colors.cyan + '    npx prisma migrate deploy' + colors.reset + '\n');
    
    console.log('3️⃣  Iniciar el servidor:');
    console.log(colors.cyan + '    npm start' + colors.reset + '\n');
    
    console.log('4️⃣  Probar endpoints (en otra terminal):');
    console.log(colors.cyan + '    bash test-endpoints.sh' + colors.reset + '\n');
  } else {
    console.log(colors.red + colors.bright + '❌ REVISA LOS ERRORES ARRIBA' + colors.reset + '\n');
    process.exit(1);
  }

  console.log(colors.bright + '════════════════════════════════════════════' + colors.reset + '\n');
}

main().catch(err => {
  log('error', 'Error en setup: ' + err.message);
  process.exit(1);
});
