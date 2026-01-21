# ✅ GUÍA DE TESTING MANUAL - TODOS LOS ENDPOINTS

**Servidor:** http://localhost:3000
**Status:** ✅ Corriendo en puerto 3000

---

## 📋 CÓMO PROBAR

### Opción 1: POSTMAN (Recomendado)
- Importa la colección de abajo
- Ejecuta cada request
- Verifica status 200/201

### Opción 2: PowerShell (Manual)
- Ejecuta cada comando uno por uno
- Copia y pega en PowerShell

---

## 1️⃣ ENDPOINTS DE LECTURA (GET)

### GET /api/v1/facturas - Listar Facturas

**PowerShell:**
```powershell
$r = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/facturas" -Method GET -UseBasicParsing
$r.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
```

**Postman:**
```
GET http://localhost:3000/api/v1/facturas
```

**Esperado:** `200 OK` con lista de facturas

---

### GET /api/v1/productos - Listar Productos

**PowerShell:**
```powershell
$r = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/productos" -Method GET -UseBasicParsing
$r.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
```

**Postman:**
```
GET http://localhost:3000/api/v1/productos
```

**Esperado:** `200 OK` con lista de productos

---

### GET /api/v1/clientes - Listar Clientes

**PowerShell:**
```powershell
$r = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/clientes" -Method GET -UseBasicParsing
$r.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
```

**Postman:**
```
GET http://localhost:3000/api/v1/clientes
```

**Esperado:** `200 OK` con lista de clientes

---

### GET /api/v1/compras - Listar Compras

**PowerShell:**
```powershell
$r = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/compras" -Method GET -UseBasicParsing
$r.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
```

**Postman:**
```
GET http://localhost:3000/api/v1/compras
```

**Esperado:** `200 OK` con lista de compras

---

### GET /api/v1/bodega/recepciones - Listar Recepciones

**PowerShell:**
```powershell
$r = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/bodega/recepciones" -Method GET -UseBasicParsing
$r.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
```

**Postman:**
```
GET http://localhost:3000/api/v1/bodega/recepciones
```

**Esperado:** `200 OK` con lista de recepciones

---

## 2️⃣ ENDPOINTS REFACTORIZADOS (Stored Procedures)

### POST /api/v1/facturas - Crear Factura ⚡ REFACTORIZADO

**PowerShell:**
```powershell
$body = @{
    id_cliente = 1
    id_carrito = "550e8400-e29b-41d4-a716-446655440000"
    id_metodo_pago = 1
    id_sucursal = 1
} | ConvertTo-Json

$r = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/facturas" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing

$r.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
```

**Postman:**
```
POST http://localhost:3000/api/v1/facturas
Content-Type: application/json

{
  "id_cliente": 1,
  "id_carrito": "550e8400-e29b-41d4-a716-446655440000",
  "id_metodo_pago": 1,
  "id_sucursal": 1
}
```

**Esperado:** `201 Created` con `id_factura`
**Función BD:** `fn_ingresar_factura()`

---

### POST /api/v1/facturas/:id/anular - Anular Factura ⚡ REFACTORIZADO

**PowerShell:**
```powershell
$idFactura = "FAC000001"  # Cambia por ID real

$r = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/facturas/$idFactura/anular" `
    -Method POST `
    -ContentType "application/json" `
    -UseBasicParsing

$r.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
```

**Postman:**
```
POST http://localhost:3000/api/v1/facturas/FAC000001/anular
Content-Type: application/json
```

**Esperado:** `200 OK` con confirmación
**Función BD:** `fn_anular_factura()`

---

### POST /api/v1/bodega/recepciones - Registrar Recepción ⚡ REFACTORIZADO

**PowerShell:**
```powershell
$body = @{
    id_compra = 1
    detalles = @(
        @{
            id_producto = "P001"
            cantidad = 10
        }
    )
} | ConvertTo-Json -Depth 3

$r = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/bodega/recepciones" `
    -Method POST `
    -Body $body `
    -ContentType "application/json" `
    -UseBasicParsing

$r.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
```

**Postman:**
```
POST http://localhost:3000/api/v1/bodega/recepciones
Content-Type: application/json

{
  "id_compra": 1,
  "detalles": [
    {
      "id_producto": "P001",
      "cantidad": 10
    }
  ]
}
```

**Esperado:** `201 Created` con `id_recepcion`
**Función BD:** `fn_ingresar_recepcion()`

---

## 3️⃣ OTROS ENDPOINTS IMPORTANTES

### GET /api/v1/categorias

**PowerShell:**
```powershell
$r = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/categorias" -Method GET -UseBasicParsing
$r.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
```

**Postman:** `GET http://localhost:3000/api/v1/categorias`

---

### GET /api/v1/marcas

**PowerShell:**
```powershell
$r = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/marcas" -Method GET -UseBasicParsing
$r.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
```

**Postman:** `GET http://localhost:3000/api/v1/marcas`

---

### GET /api/v1/sucursales

**PowerShell:**
```powershell
$r = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/sucursales" -Method GET -UseBasicParsing
$r.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
```

**Postman:** `GET http://localhost:3000/api/v1/sucursales`

---

### GET /api/v1/metodos-pago

**PowerShell:**
```powershell
$r = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/metodos-pago" -Method GET -UseBasicParsing
$r.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
```

**Postman:** `GET http://localhost:3000/api/v1/metodos-pago`

---

### GET /api/v1/bodegas

**PowerShell:**
```powershell
$r = Invoke-WebRequest -Uri "http://localhost:3000/api/v1/bodegas" -Method GET -UseBasicParsing
$r.Content | ConvertFrom-Json | ConvertTo-Json -Depth 3
```

**Postman:** `GET http://localhost:3000/api/v1/bodegas`

---

## 📊 CHECKLIST DE VALIDACIÓN

Marca cada uno cuando funcione:

### Lectura (GET)
- [ ] GET /api/v1/facturas → 200 OK
- [ ] GET /api/v1/productos → 200 OK
- [ ] GET /api/v1/clientes → 200 OK
- [ ] GET /api/v1/compras → 200 OK
- [ ] GET /api/v1/bodega/recepciones → 200 OK
- [ ] GET /api/v1/categorias → 200 OK
- [ ] GET /api/v1/marcas → 200 OK
- [ ] GET /api/v1/sucursales → 200 OK
- [ ] GET /api/v1/metodos-pago → 200 OK
- [ ] GET /api/v1/bodegas → 200 OK

### Refactorizados (POST) - Con Stored Procedures
- [ ] POST /api/v1/facturas → 201 Created ⚡
- [ ] POST /api/v1/facturas/:id/anular → 200 OK ⚡
- [ ] POST /api/v1/bodega/recepciones → 201 Created ⚡

---

## 🎯 ENDPOINTS LISTOS PARA FRONTEND

Una vez que todos los checkboxes estén marcados, tu backend está 100% listo para conectar con el frontend.

### Estructura de respuesta estándar:

```json
{
  "status": "success",
  "message": "Mensaje descriptivo",
  "data": { ... }  // o [...] para listas
}
```

### Errores:

```json
{
  "status": "error",
  "message": "Mensaje de error",
  "data": null
}
```

---

## 📱 COLECCIÓN POSTMAN

Importa este JSON en Postman:

```json
{
  "info": {
    "name": "E-Commerce Backend - Tests Completos",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000/api/v1"
    }
  ],
  "item": [
    {
      "name": "Facturas",
      "item": [
        {
          "name": "Listar Facturas",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/facturas"
          }
        },
        {
          "name": "Crear Factura (SP)",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\"id_cliente\": 1, \"id_carrito\": \"550e8400-e29b-41d4-a716-446655440000\", \"id_metodo_pago\": 1, \"id_sucursal\": 1}"
            },
            "url": "{{base_url}}/facturas"
          }
        },
        {
          "name": "Anular Factura (SP)",
          "request": {
            "method": "POST",
            "url": "{{base_url}}/facturas/FAC000001/anular"
          }
        }
      ]
    },
    {
      "name": "Bodega",
      "item": [
        {
          "name": "Listar Recepciones",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/bodega/recepciones"
          }
        },
        {
          "name": "Registrar Recepción (SP)",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "body": {
              "mode": "raw",
              "raw": "{\"id_compra\": 1, \"detalles\": [{\"id_producto\": \"P001\", \"cantidad\": 10}]}"
            },
            "url": "{{base_url}}/bodega/recepciones"
          }
        }
      ]
    },
    {
      "name": "Catálogo",
      "item": [
        {
          "name": "Listar Productos",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/productos"
          }
        },
        {
          "name": "Listar Categorías",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/categorias"
          }
        },
        {
          "name": "Listar Marcas",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/marcas"
          }
        }
      ]
    },
    {
      "name": "Maestros",
      "item": [
        {
          "name": "Listar Clientes",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/clientes"
          }
        },
        {
          "name": "Listar Sucursales",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/sucursales"
          }
        },
        {
          "name": "Listar Métodos de Pago",
          "request": {
            "method": "GET",
            "url": "{{base_url}}/metodos-pago"
          }
        }
      ]
    }
  ]
}
```

---

## ✅ CONFIRMACIÓN FINAL

Si todos los endpoints responden correctamente:

✅ **Backend 100% funcional**
✅ **Refactorización completada**
✅ **Stored Procedures funcionando**
✅ **Listo para conectar con Frontend**

---

**Fecha:** 2024
**Servidor:** http://localhost:3000
**BD:** PostgreSQL @ 10.191.152.179:5433
