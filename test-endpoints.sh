#!/bin/bash

# ============================================================================
# EJEMPLOS DE TESTING CON CURL
# ============================================================================
# Ejecutar en terminal (Git Bash, Linux, macOS, o WSL)
# O copiar cada request a Postman manualmente

BASE_URL="http://localhost:3000/api/v1"

echo "================================"
echo "TESTING ENDPOINTS - FACTURACIÓN"
echo "================================"
echo ""

# ============================================================================
# 1. CREAR FACTURA
# ============================================================================
echo "1️⃣  Crear Factura (POST /facturas)"
echo "---"
echo "Reemplaza los IDs con datos reales de tu BD:"
echo ""

curl -X POST "$BASE_URL/facturas" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "id_cliente": 1,
    "id_carrito": "550e8400-e29b-41d4-a716-446655440000",
    "id_metodo_pago": 1,
    "id_sucursal": 1
  }' | jq .

echo ""
echo ""

# ============================================================================
# 2. ANULAR FACTURA
# ============================================================================
echo "2️⃣  Anular Factura (POST /facturas/:id/anular)"
echo "---"
echo "Reemplaza FAC000001 con un ID de factura real:"
echo ""

curl -X POST "$BASE_URL/facturas/FAC000001/anular" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{}' | jq .

echo ""
echo ""

# ============================================================================
# 3. REGISTRAR RECEPCIÓN
# ============================================================================
echo "3️⃣  Registrar Recepción (POST /bodega/recepciones)"
echo "---"
echo "Reemplaza los datos con valores reales:"
echo ""

curl -X POST "$BASE_URL/bodega/recepciones" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "id_compra": 1,
    "detalles": [
      {
        "id_producto": "P001",
        "cantidad": 10
      },
      {
        "id_producto": "P002",
        "cantidad": 5
      }
    ]
  }' | jq .

echo ""
echo ""

# ============================================================================
# POSTMAN COLLECTION
# ============================================================================
echo "📮 POSTMAN COLLECTION (JSON)"
echo "---"
echo "Copia esto en Postman (New > Paste raw text > Continue):"
echo ""

cat << 'EOF'
{
  "info": {
    "name": "E-Commerce API - Refactoring",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Crear Factura",
      "request": {
        "method": "POST",
        "header": [
          {"key": "Content-Type", "value": "application/json"},
          {"key": "Authorization", "value": "Bearer {{jwt_token}}"}
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"id_cliente\": 1,\n  \"id_carrito\": \"550e8400-e29b-41d4-a716-446655440000\",\n  \"id_metodo_pago\": 1,\n  \"id_sucursal\": 1\n}"
        },
        "url": {"raw": "{{base_url}}/facturas", "host": ["{{base_url}}"], "path": ["facturas"]}
      }
    },
    {
      "name": "Anular Factura",
      "request": {
        "method": "POST",
        "header": [
          {"key": "Content-Type", "value": "application/json"},
          {"key": "Authorization", "value": "Bearer {{jwt_token}}"}
        ],
        "body": {"mode": "raw", "raw": "{}"},
        "url": {"raw": "{{base_url}}/facturas/FAC000001/anular", "host": ["{{base_url}}"], "path": ["facturas", ":id", "anular"]}
      }
    },
    {
      "name": "Registrar Recepción",
      "request": {
        "method": "POST",
        "header": [
          {"key": "Content-Type", "value": "application/json"},
          {"key": "Authorization", "value": "Bearer {{jwt_token}}"}
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"id_compra\": 1,\n  \"detalles\": [\n    {\"id_producto\": \"P001\", \"cantidad\": 10},\n    {\"id_producto\": \"P002\", \"cantidad\": 5}\n  ]\n}"
        },
        "url": {"raw": "{{base_url}}/bodega/recepciones", "host": ["{{base_url}}"], "path": ["bodega", "recepciones"]}
      }
    }
  ]
}
EOF

echo ""
echo ""
echo "================================"
echo "VARIABLES POSTMAN"
echo "================================"
echo "base_url: http://localhost:3000/api/v1"
echo "jwt_token: [Tu token JWT aquí]"
echo ""
