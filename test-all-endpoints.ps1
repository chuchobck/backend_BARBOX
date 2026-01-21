# Script de Testing Completo - E-Commerce Backend
# PowerShell version

$baseUrl = "http://localhost:3000/api/v1"
$testResults = @()

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "   TESTING COMPLETO - E-COMMERCE BACKEND" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

function Test-Endpoint {
    param(
        [string]$Method,
        [string]$Url,
        [string]$Description,
        [object]$Body = $null
    )
    
    Write-Host "Testing: $Description" -ForegroundColor Yellow
    Write-Host "  $Method $Url" -ForegroundColor Gray
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Body) {
            $jsonBody = $Body | ConvertTo-Json -Depth 10
            $response = Invoke-WebRequest -Uri $Url -Method $Method -Headers $headers -Body $jsonBody -UseBasicParsing
        } else {
            $response = Invoke-WebRequest -Uri $Url -Method $Method -Headers $headers -UseBasicParsing
        }
        
        $statusCode = $response.StatusCode
        $content = $response.Content | ConvertFrom-Json
        
        Write-Host "  ✅ SUCCESS - Status: $statusCode" -ForegroundColor Green
        
        if ($content.data) {
            if ($content.data -is [array]) {
                Write-Host "  📊 Records: $($content.data.Count)" -ForegroundColor Cyan
            } else {
                Write-Host "  📊 Data: $($content.data | ConvertTo-Json -Depth 2 -Compress)" -ForegroundColor Cyan
            }
        }
        
        return @{
            Success = $true
            Status = $statusCode
            Data = $content
        }
        
    } catch {
        $errorMsg = $_.Exception.Message
        Write-Host "  ❌ ERROR: $errorMsg" -ForegroundColor Red
        
        return @{
            Success = $false
            Error = $errorMsg
        }
    }
    
    Write-Host ""
}

# ============================================
# 1. ENDPOINTS DE LECTURA (GET)
# ============================================

Write-Host "`n1️⃣  TESTING ENDPOINTS DE LECTURA (GET)`n" -ForegroundColor Magenta

$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/facturas" -Description "Listar todas las facturas"
$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/productos" -Description "Listar todos los productos"
$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/clientes" -Description "Listar todos los clientes"
$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/compras" -Description "Listar todas las compras"
$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/bodega/recepciones" -Description "Listar recepciones de bodega"
$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/categorias" -Description "Listar categorías"
$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/marcas" -Description "Listar marcas"
$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/sucursales" -Description "Listar sucursales"

# ============================================
# 2. ENDPOINTS REFACTORIZADOS (Stored Procedures)
# ============================================

Write-Host "`n2️⃣  TESTING ENDPOINTS REFACTORIZADOS (Stored Procedures)`n" -ForegroundColor Magenta

Write-Host "⚠️  NOTA: Los siguientes tests requieren datos válidos en BD" -ForegroundColor Yellow
Write-Host "   Si fallan, es porque necesitas IDs reales de tu base de datos`n" -ForegroundColor Yellow

# Test 1: Crear Factura (fn_ingresar_factura)
Write-Host "📝 Test: Crear Factura (REFACTORIZADO)" -ForegroundColor Cyan
$facturaBody = @{
    id_cliente = 1
    id_carrito = "550e8400-e29b-41d4-a716-446655440000"
    id_metodo_pago = 1
    id_sucursal = 1
}

$resultFactura = Test-Endpoint -Method "POST" -Url "$baseUrl/facturas" -Description "Crear factura con fn_ingresar_factura" -Body $facturaBody
$testResults += $resultFactura

# Si se creó factura, intentar anularla
if ($resultFactura.Success -and $resultFactura.Data.data.id_factura) {
    $idFactura = $resultFactura.Data.data.id_factura
    Write-Host "📝 Test: Anular Factura '$idFactura' (REFACTORIZADO)" -ForegroundColor Cyan
    $testResults += Test-Endpoint -Method "POST" -Url "$baseUrl/facturas/$idFactura/anular" -Description "Anular factura con fn_anular_factura"
}

# Test 2: Registrar Recepción (fn_ingresar_recepcion)
Write-Host "📝 Test: Registrar Recepción de Bodega (REFACTORIZADO)" -ForegroundColor Cyan
$recepcionBody = @{
    id_compra = 1
    detalles = @(
        @{
            id_producto = "P001"
            cantidad = 10
        }
    )
}

$testResults += Test-Endpoint -Method "POST" -Url "$baseUrl/bodega/recepciones" -Description "Registrar recepcion con fn_ingresar_recepcion" -Body $recepcionBody

# ============================================
# 3. OTROS ENDPOINTS IMPORTANTES
# ============================================

Write-Host "`n3️⃣  TESTING OTROS ENDPOINTS IMPORTANTES`n" -ForegroundColor Magenta

$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/metodos-pago" -Description "Listar métodos de pago"
$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/roles" -Description "Listar roles"
$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/bodegas" -Description "Listar bodegas"
$testResults += Test-Endpoint -Method "GET" -Url "$baseUrl/canales-venta" -Description "Listar canales de venta"

# ============================================
# RESUMEN FINAL
# ============================================

Write-Host "`n============================================" -ForegroundColor Cyan
Write-Host "          RESUMEN DE TESTS" -ForegroundColor Cyan
Write-Host "============================================`n" -ForegroundColor Cyan

$totalTests = $testResults.Count
$passedTests = ($testResults | Where-Object { $_.Success -eq $true }).Count
$failedTests = $totalTests - $passedTests

Write-Host "Total de tests ejecutados: $totalTests" -ForegroundColor White
Write-Host "✅ Tests exitosos: $passedTests" -ForegroundColor Green
Write-Host "❌ Tests fallidos: $failedTests" -ForegroundColor Red

$successRate = [math]::Round(($passedTests / $totalTests) * 100, 2)
Write-Host "`n📊 Tasa de éxito: $successRate%" -ForegroundColor Cyan

if ($failedTests -eq 0) {
    Write-Host "`n🎉 TODOS LOS TESTS PASARON - BACKEND LISTO PARA FRONTEND!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Algunos tests fallaron. Revisa los errores arriba." -ForegroundColor Yellow
    Write-Host "   Esto puede ser normal si no hay datos en la BD o IDs incorrectos." -ForegroundColor Yellow
}

Write-Host "`n============================================`n" -ForegroundColor Cyan

# Guardar resultados en archivo JSON
$testResults | ConvertTo-Json -Depth 10 | Out-File "test-results.json"
Write-Host "📄 Resultados guardados en: test-results.json`n" -ForegroundColor Gray
