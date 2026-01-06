// prisma/seed.js (ESM)

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Recrear __dirname en ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

async function main() {
  // Ruta al JSON: ../data/productos.json
  const filePath = path.join(__dirname, "..", "data", "productos.json");

  const raw = await fs.promises.readFile(filePath, "utf8");
  const productos = JSON.parse(raw);

  // La BD generará el id; solo usamos nombre y precio
  const data = productos.map((p) => ({
    nombre: p.nombre,
    precio: p.precio
  }));

  await prisma.producto.createMany({
    data
  });

  console.log("✅ Productos importados desde productos.json a SQL Server");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
