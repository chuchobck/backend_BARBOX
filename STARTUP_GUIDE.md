# 🚀 GUÍA RÁPIDA: INICIAR BACKEND EN 5 MINUTOS

**Objetivo:** Tener el backend corriendo localmente y testear los endpoints.

---

## ⚡ PASO 1: VALIDAR CONFIGURACIÓN (1 min)

Abre PowerShell en `c:\Users\agloo\backend` y ejecuta:

```powershell
node setup-validator.js
```

**Esperado:** ✅ Verdes

Si ves ❌ en rojo, revisa el error antes de continuar.

---

## 💾 PASO 2: INSTALAR DEPENDENCIAS (2 min)

```powershell
npm install
```

**Esperado:** `added X packages` sin errores

Si tarda mucho, espera 🕐

---

## 🗄️ PASO 3: MIGRACIONES PRISMA (1 min)

```powershell
npx prisma migrate deploy
```

**Esperado:** ✅ Migraciones aplicadas correctamente

---

## ▶️ PASO 4: INICIAR SERVIDOR (1 min)

```powershell
npm start
```

**Esperado:**
```
✅ Servidor escuchando en puerto 3000
✅ Base de datos conectada
```

**No cierres esta ventana** - déjala ejecutándose

---

## 🧪 PASO 5: PROBAR ENDPOINTS (1 min)

Abre **nueva ventana** de PowerShell en la misma carpeta:

```powershell
# Opción 1: Usar Postman
# - Abre Postman
# - Copia los ejemplos de test-endpoints.sh
# - Pega en Postman y presiona Send

# Opción 2: Usar curl (en PowerShell o Git Bash)
bash test-endpoints.sh

# Opción 3: Probar endpoint específico
curl -X GET http://localhost:3000/api/v1/facturas
```

---

## ✅ VALIDATION CHECKLIST

Marca cada una que funcione:

- [ ] `node setup-validator.js` → ✅ Verde
- [ ] `npm install` → Sin errores
- [ ] `npx prisma migrate deploy` → Migraciones aplicadas
- [ ] `npm start` → Servidor en 3000
- [ ] `curl GET /api/v1/facturas` → 200 OK

Si todo está ✅ **¡LISTO!**

---

## 🆘 TROUBLESHOOTING

### ❌ Error: "ECONNREFUSED" o "Network error"
**Problema:** No puede conectar a la BD  
**Solución:**
```powershell
node test-conexion.js
# Verifica que el host 10.191.152.179:5433 es accesible
```

### ❌ Error: "ENOTFOUND e_commerce_licores"
**Problema:** No resuelve el host  
**Solución:**
```powershell
# Verifica .env tiene DATABASE_URL correcto
cat .env | grep DATABASE_URL
```

### ❌ Error: "function fn_ingresar_factura does not exist"
**Problema:** Las funciones almacenadas no existen en BD  
**Solución:** James debe crearlas en PostgreSQL  
**Contacta:** Tu compañero DBA para que cree las 5 funciones

### ❌ Error: "npm: command not found"
**Problema:** Node.js no está instalado  
**Solución:**
```powershell
# Descargar desde https://nodejs.org/
# Instalar versión LTS (18+)
node --version  # Verificar
```

---

## 📝 ENDPOINTS DISPONIBLES

### Facturación
- `GET /api/v1/facturas` → Listar todas
- `POST /api/v1/facturas` → Crear factura (REFACTORIZADO) ⚡
- `POST /api/v1/facturas/:id/anular` → Anular (REFACTORIZADO) ⚡
- `GET /api/v1/facturas/:id` → Obtener detalle

### Bodega
- `GET /api/v1/bodega/recepciones` → Listar recepciones
- `POST /api/v1/bodega/recepciones` → Registrar (REFACTORIZADO) ⚡
- `GET /api/v1/bodega/recepciones/:id` → Obtener detalle

### Otros módulos
- Compra, Cliente, Producto, etc. → Funcionan normal

**⚡ = Usando funciones almacenadas (NEW!)**

---

## 🧑‍💻 EJEMPLO: CREAR FACTURA

### Con Postman:

1. Abre Postman
2. POST → `http://localhost:3000/api/v1/facturas`
3. Headers:
   ```
   Content-Type: application/json
   ```
4. Body (raw JSON):
   ```json
   {
     "id_cliente": 1,
     "id_carrito": "550e8400-e29b-41d4-a716-446655440000",
     "id_metodo_pago": 1,
     "id_sucursal": 1
   }
   ```
5. Send

**Esperado:**
```json
{
  "status": "success",
  "message": "Factura creada correctamente",
  "data": {
    "id_factura": "FAC000001",
    "total": 1500.00,
    "estado": "EMI"
  }
}
```

### Con curl:

```bash
curl -X POST http://localhost:3000/api/v1/facturas \
  -H "Content-Type: application/json" \
  -d '{
    "id_cliente": 1,
    "id_carrito": "550e8400-e29b-41d4-a716-446655440000",
    "id_metodo_pago": 1,
    "id_sucursal": 1
  }'
```

---

## 📱 IMPORTANTE: DATOS REALES

**ANTES DE PROBAR**, necesitas datos reales en la BD:

- ✅ Al menos 1 cliente
- ✅ Al menos 1 carrito con items
- ✅ Al menos 1 método de pago
- ✅ Al menos 1 sucursal

Si los datos no existen en BD, los endpoints fallarán (eso es correcto).

---

## 🎯 SIGUIENTE

Una vez que todo funcione:

1. Notifica a James que cree las 5 funciones almacenadas:
   - `fn_ingresar_factura()`
   - `fn_anular_factura()`
   - `fn_ingresar_recepcion()`
   - `fn_aprobar_recepcion()`
   - `fn_anular_recepcion()`

2. Ejecuta tests completos

3. ¡A producción! 🚀

---

## 📞 SOPORTE RÁPIDO

| Problema | Comando |
|----------|---------|
| Ver logs | Ver ventana del servidor |
| Reiniciar | Ctrl+C en servidor, luego `npm start` |
| Limpiar BD | `npx prisma db push --skip-generate` |
| Ver .env | `cat .env` |
| Ver cambios | `git diff src/controllers/` |

---

**¡Cualquier duda?** Revisa [ESTADO_DEL_BACKEND.md](ESTADO_DEL_BACKEND.md) o [CHECKLIST_REFACTORING.md](CHECKLIST_REFACTORING.md)

**Buen trabajo! 🎉**
