-- ============================================================================
-- ESPECIFICACIÓN DE STORED PROCEDURES
-- Para el Sistema POS/Bodega
-- 
-- Responsable: James (Base de Datos)
-- Estado: Pendiente de Implementación
-- Fecha: 20 de Enero de 2026
-- ============================================================================

-- ============================================================================
-- SP 1: sp_cliente_crear()
-- Módulo: Ventas (POS)
-- Propósito: Crear un cliente nuevo en el sistema
-- ============================================================================

CREATE OR REPLACE FUNCTION sp_cliente_crear(
  p_ruc_cedula VARCHAR(13),
  p_nombre1 VARCHAR(50),
  p_apellido1 VARCHAR(50),
  p_email VARCHAR(100) DEFAULT NULL,
  p_telefono VARCHAR(20) DEFAULT NULL,
  p_id_ciudad CHAR(3) DEFAULT NULL
)
RETURNS TABLE (
  id_cliente INTEGER,
  ruc_cedula VARCHAR(13),
  nombre1 VARCHAR(50),
  apellido1 VARCHAR(50),
  email VARCHAR(100),
  telefono VARCHAR(20),
  id_ciudad CHAR(3),
  estado CHAR(3),
  fecha_creacion TIMESTAMP,
  error BOOLEAN,
  mensaje TEXT
) AS $$
DECLARE
  v_id_cliente INTEGER;
  v_error BOOLEAN := FALSE;
  v_mensaje TEXT := '';
BEGIN
  -- Validación: Cédula/RUC obligatorio y único
  IF p_ruc_cedula IS NULL OR p_ruc_cedula = '' THEN
    v_error := TRUE;
    v_mensaje := 'Cédula/RUC es obligatorio';
    RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
    RETURN;
  END IF;

  -- Validación: Nombre obligatorio
  IF p_nombre1 IS NULL OR p_nombre1 = '' THEN
    v_error := TRUE;
    v_mensaje := 'Nombre es obligatorio';
    RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
    RETURN;
  END IF;

  -- Validación: Apellido obligatorio
  IF p_apellido1 IS NULL OR p_apellido1 = '' THEN
    v_error := TRUE;
    v_mensaje := 'Apellido es obligatorio';
    RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
    RETURN;
  END IF;

  -- Validación: Verificar si cliente ya existe
  IF EXISTS (SELECT 1 FROM cliente WHERE ruc_cedula = p_ruc_cedula) THEN
    v_error := TRUE;
    v_mensaje := 'El cliente con esta cédula/RUC ya existe';
    RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
    RETURN;
  END IF;

  -- Validación: Si se proporciona ciudad, debe existir
  IF p_id_ciudad IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM ciudad WHERE id_ciudad = p_id_ciudad) THEN
      v_error := TRUE;
      v_mensaje := 'La ciudad no existe';
      RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
      RETURN;
    END IF;
  END IF;

  -- Crear el cliente
  INSERT INTO cliente (ruc_cedula, nombre1, apellido1, email, telefono, id_ciudad, estado)
  VALUES (p_ruc_cedula, p_nombre1, p_apellido1, p_email, p_telefono, p_id_ciudad, 'ACT')
  RETURNING cliente.id_cliente INTO v_id_cliente;

  -- Registrar en auditoría
  INSERT INTO auditoria (id_usuario, accion, tabla, clave_registro, valores_anteriores, descripcion)
  VALUES (1, 'CREATE', 'cliente', v_id_cliente::TEXT, NULL, 'Cliente creado por POS');

  -- Retornar cliente creado
  RETURN QUERY 
  SELECT 
    c.id_cliente,
    c.ruc_cedula,
    c.nombre1,
    c.apellido1,
    c.email,
    c.telefono,
    c.id_ciudad,
    c.estado,
    c.fecha_creacion,
    FALSE,
    'Cliente creado exitosamente'
  FROM cliente c
  WHERE c.id_cliente = v_id_cliente;

EXCEPTION WHEN OTHERS THEN
  v_error := TRUE;
  v_mensaje := 'Error en la base de datos: ' || SQLERRM;
  RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ============================================================================
-- SP 2: sp_factura_crear()
-- Módulo: Ventas (POS)
-- Propósito: Crear factura desde carrito con todas sus validaciones y movimientos
-- ============================================================================

CREATE OR REPLACE FUNCTION sp_factura_crear(
  p_id_cliente INTEGER,
  p_id_carrito UUID,
  p_id_metodo_pago INTEGER,
  p_id_sucursal INTEGER,
  p_id_empleado INTEGER DEFAULT NULL
)
RETURNS TABLE (
  id_factura VARCHAR(20),
  numero_factura VARCHAR(20),
  fecha_emision TIMESTAMP,
  subtotal DECIMAL(14, 3),
  total_iva DECIMAL(14, 3),
  total DECIMAL(14, 3),
  estado CHAR(3),
  num_detalles INTEGER,
  error BOOLEAN,
  mensaje TEXT
) AS $$
DECLARE
  v_id_factura VARCHAR(20);
  v_numero_factura VARCHAR(20);
  v_canal_venta CHAR(3);
  v_subtotal DECIMAL(14, 3);
  v_total_iva DECIMAL(14, 3);
  v_total DECIMAL(14, 3);
  v_porcentaje_iva DECIMAL(5, 2);
  v_num_detalles INTEGER;
  v_error BOOLEAN := FALSE;
  v_mensaje TEXT := '';
  v_carrito_record RECORD;
  v_detalle_record RECORD;
  v_saldo_producto DECIMAL(14, 3);
BEGIN
  -- Validación: Cliente obligatorio
  IF p_id_cliente IS NULL THEN
    v_error := TRUE;
    v_mensaje := 'Cliente es obligatorio';
    RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
    RETURN;
  END IF;

  -- Validación: Carrito obligatorio
  IF p_id_carrito IS NULL THEN
    v_error := TRUE;
    v_mensaje := 'Carrito es obligatorio';
    RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
    RETURN;
  END IF;

  -- Validación: Verificar que cliente existe
  IF NOT EXISTS (SELECT 1 FROM cliente WHERE id_cliente = p_id_cliente AND estado = 'ACT') THEN
    v_error := TRUE;
    v_mensaje := 'Cliente no existe o está inactivo';
    RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
    RETURN;
  END IF;

  -- Validación: Verificar que carrito existe y está activo
  SELECT * INTO v_carrito_record FROM carrito 
  WHERE id_carrito = p_id_carrito AND estado = 'ACT' AND id_cliente = p_id_cliente;

  IF v_carrito_record IS NULL THEN
    v_error := TRUE;
    v_mensaje := 'Carrito no existe o no está activo';
    RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
    RETURN;
  END IF;

  -- Validación: Carrito debe tener items
  SELECT COUNT(*) INTO v_num_detalles FROM carrito_detalle 
  WHERE id_carrito = p_id_carrito;

  IF v_num_detalles = 0 THEN
    v_error := TRUE;
    v_mensaje := 'El carrito está vacío';
    RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
    RETURN;
  END IF;

  -- Validación: Método de pago existe y está activo
  IF NOT EXISTS (
    SELECT 1 FROM metodo_pago 
    WHERE id_metodo_pago = p_id_metodo_pago AND estado = 'ACT'
  ) THEN
    v_error := TRUE;
    v_mensaje := 'Método de pago no existe o está inactivo';
    RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
    RETURN;
  END IF;

  -- Validación: Sucursal existe y está activa
  IF NOT EXISTS (
    SELECT 1 FROM sucursal 
    WHERE id_sucursal = p_id_sucursal AND activo = true
  ) THEN
    v_error := TRUE;
    v_mensaje := 'Sucursal no existe o está inactiva';
    RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
    RETURN;
  END IF;

  -- Determinar canal de venta
  IF p_id_empleado IS NOT NULL THEN
    v_canal_venta := 'POS';
  ELSE
    v_canal_venta := 'WEB';
  END IF;

  -- Validación: Productos en carrito deben tener stock
  FOR v_detalle_record IN
    SELECT cd.id_producto, cd.cantidad, p.saldo_actual
    FROM carrito_detalle cd
    JOIN producto p ON cd.id_producto = p.id_producto
    WHERE cd.id_carrito = p_id_carrito
  LOOP
    IF v_detalle_record.saldo_actual < v_detalle_record.cantidad THEN
      v_error := TRUE;
      v_mensaje := 'Stock insuficiente para producto: ' || v_detalle_record.id_producto;
      RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
      RETURN;
    END IF;
  END LOOP;

  -- Obtener IVA (por defecto 15% si existe en id 1)
  SELECT porcentaje INTO v_porcentaje_iva FROM iva WHERE id_iva = 1;
  IF v_porcentaje_iva IS NULL THEN
    v_porcentaje_iva := 15;
  END IF;

  -- Calcular totales desde el carrito
  v_subtotal := v_carrito_record.subtotal;
  v_total_iva := (v_subtotal * v_porcentaje_iva) / 100;
  v_total := v_subtotal + v_total_iva;

  -- Generar número de factura (formato: YYYYMMDDHHMMSS + secuencia)
  v_numero_factura := TO_CHAR(NOW(), 'YYYYMMDDHHMMSS') || LPAD((
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_factura, 15, 4) AS INTEGER)), 0) + 1 
    FROM factura 
    WHERE TO_DATE(SUBSTRING(numero_factura, 1, 8), 'YYYYMMDD') = CURRENT_DATE
  )::TEXT, 4, '0');

  -- Generar ID única de factura
  v_id_factura := v_numero_factura;

  -- TRANSACCIÓN: Crear factura
  BEGIN
    -- 1. Insertar factura
    INSERT INTO factura (
      id_factura, numero_factura, id_cliente, id_carrito, id_metodo_pago, 
      id_sucursal, id_empleado, id_canal_venta, id_iva,
      subtotal, total_iva, total, estado
    ) VALUES (
      v_id_factura, v_numero_factura, p_id_cliente, p_id_carrito, 
      p_id_metodo_pago, p_id_sucursal, p_id_empleado, v_canal_venta, 1,
      v_subtotal, v_total_iva, v_total, 'COM'
    );

    -- 2. Copiar detalles del carrito a detalle_factura
    INSERT INTO detalle_factura (id_factura, id_producto, cantidad, precio_unitario, subtotal)
    SELECT 
      v_id_factura, cd.id_producto, cd.cantidad, 
      cd.precio_unitario, cd.subtotal
    FROM carrito_detalle cd
    WHERE cd.id_carrito = p_id_carrito;

    -- 3. Actualizar saldo de productos (disminuir stock)
    UPDATE producto p
    SET saldo_actual = p.saldo_actual - cd.cantidad
    FROM carrito_detalle cd
    WHERE cd.id_carrito = p_id_carrito 
      AND p.id_producto = cd.id_producto;

    -- 4. Marcar carrito como completado
    UPDATE carrito 
    SET estado = 'COM', fecha_actualizacion = NOW()
    WHERE id_carrito = p_id_carrito;

    -- 5. Registrar en auditoría
    INSERT INTO auditoria (id_usuario, accion, tabla, clave_registro, valores_anteriores, descripcion)
    VALUES (p_id_empleado, 'CREATE', 'factura', v_id_factura, NULL, 'Factura creada desde POS');

  EXCEPTION WHEN OTHERS THEN
    v_error := TRUE;
    v_mensaje := 'Error al crear factura: ' || SQLERRM;
    RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
    RETURN;
  END;

  -- Retornar factura creada
  RETURN QUERY 
  SELECT 
    v_id_factura,
    v_numero_factura,
    NOW(),
    v_subtotal,
    v_total_iva,
    v_total,
    'COM',
    v_num_detalles,
    FALSE,
    'Factura creada exitosamente'::TEXT;

EXCEPTION WHEN OTHERS THEN
  v_error := TRUE;
  v_mensaje := 'Error en la base de datos: ' || SQLERRM;
  RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ============================================================================
-- SP 3: sp_recepcion_registrar()
-- Módulo: Bodega
-- Propósito: Registrar recepción de mercadería desde orden de compra
-- ============================================================================

CREATE OR REPLACE FUNCTION sp_recepcion_registrar(
  p_id_compra INTEGER,
  p_detalles JSONB,
  p_id_empleado INTEGER DEFAULT NULL
)
RETURNS TABLE (
  id_recepcion INTEGER,
  num_productos INTEGER,
  fecha_recepcion TIMESTAMP,
  estado CHAR(3),
  id_compra_nuevo_estado CHAR(3),
  error BOOLEAN,
  mensaje TEXT
) AS $$
DECLARE
  v_id_recepcion INTEGER;
  v_num_productos INTEGER;
  v_error BOOLEAN := FALSE;
  v_mensaje TEXT := '';
  v_compra_record RECORD;
  v_detalle JSONB;
  v_id_producto VARCHAR(7);
  v_cantidad INTEGER;
  v_cantidad_pendiente INTEGER;
  v_cantidad_recibida INTEGER;
  v_id_detalle_compra INTEGER;
  v_todos_completos BOOLEAN := TRUE;
  v_nuevo_estado_compra CHAR(3);
  v_idx INTEGER := 0;
BEGIN
  -- Validación: Orden de compra obligatoria
  IF p_id_compra IS NULL THEN
    v_error := TRUE;
    v_mensaje := 'ID de compra es obligatorio';
    RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
    RETURN;
  END IF;

  -- Validación: Detalles obligatorios
  IF p_detalles IS NULL OR p_detalles = 'null'::JSONB OR jsonb_array_length(p_detalles) = 0 THEN
    v_error := TRUE;
    v_mensaje := 'Detalles de recepción son obligatorios';
    RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
    RETURN;
  END IF;

  -- Validación: Orden de compra existe
  SELECT * INTO v_compra_record FROM compra 
  WHERE id_compra = p_id_compra;

  IF v_compra_record IS NULL THEN
    v_error := TRUE;
    v_mensaje := 'La orden de compra no existe';
    RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
    RETURN;
  END IF;

  -- Validación: Orden de compra no está anulada
  IF v_compra_record.estado = 'ANU' THEN
    v_error := TRUE;
    v_mensaje := 'No se puede recibir una orden anulada';
    RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
    RETURN;
  END IF;

  -- TRANSACCIÓN: Procesar recepción
  BEGIN
    -- Crear registro de recepción
    INSERT INTO recepcion (id_compra, id_empleado, descripcion, num_productos, estado)
    VALUES (p_id_compra, p_id_empleado, 'Recepción de mercadería', 0, 'ACT')
    RETURNING id_recepcion INTO v_id_recepcion;

    v_num_productos := 0;

    -- Procesar cada detalle
    FOR v_idx IN 0 .. jsonb_array_length(p_detalles) - 1 LOOP
      v_detalle := p_detalles -> v_idx;

      v_id_producto := v_detalle ->> 'productoId';
      v_cantidad := (v_detalle ->> 'cantidad')::INTEGER;

      -- Validación: Producto obligatorio
      IF v_id_producto IS NULL THEN
        v_error := TRUE;
        v_mensaje := 'Producto ID faltante en detalle ' || v_idx;
        RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
        RETURN;
      END IF;

      -- Validación: Cantidad válida
      IF v_cantidad IS NULL OR v_cantidad <= 0 THEN
        v_error := TRUE;
        v_mensaje := 'Cantidad inválida para producto ' || v_id_producto;
        RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
        RETURN;
      END IF;

      -- Validación: Producto existe en la orden de compra
      SELECT id_detalle_compra, cantidad, COALESCE(cantidad_recibida, 0)
      INTO v_id_detalle_compra, v_cantidad_pendiente, v_cantidad_recibida
      FROM detalle_compra 
      WHERE id_compra = p_id_compra AND id_producto = v_id_producto;

      IF v_id_detalle_compra IS NULL THEN
        v_error := TRUE;
        v_mensaje := 'El producto ' || v_id_producto || ' no existe en esta orden';
        RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
        RETURN;
      END IF;

      -- Validación: Cantidad no excede lo pendiente
      v_cantidad_pendiente := v_cantidad_pendiente - v_cantidad_recibida;
      
      IF v_cantidad > v_cantidad_pendiente THEN
        v_error := TRUE;
        v_mensaje := 'Cantidad excede lo pendiente para ' || v_id_producto || 
                     '. Pendiente: ' || v_cantidad_pendiente;
        RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
        RETURN;
      END IF;

      -- Insertar en detalle_recepcion
      INSERT INTO detalle_recepcion (id_recepcion, id_producto, cantidad)
      VALUES (v_id_recepcion, v_id_producto, v_cantidad);

      -- Actualizar cantidad_recibida en detalle_compra
      UPDATE detalle_compra 
      SET cantidad_recibida = cantidad_recibida + v_cantidad
      WHERE id_detalle_compra = v_id_detalle_compra;

      -- Incrementar ingresos en producto
      UPDATE producto 
      SET ingresos = COALESCE(ingresos, 0) + v_cantidad
      WHERE id_producto = v_id_producto;

      v_num_productos := v_num_productos + 1;
    END LOOP;

    -- Actualizar num_productos en recepcion
    UPDATE recepcion 
    SET num_productos = v_num_productos
    WHERE id_recepcion = v_id_recepcion;

    -- Actualizar estado de la orden de compra
    SELECT 
      CASE 
        WHEN COUNT(*) FILTER (WHERE cantidad_recibida >= cantidad) = COUNT(*) THEN 'COM'
        WHEN COUNT(*) FILTER (WHERE cantidad_recibida > 0) > 0 THEN 'PAR'
        ELSE 'PEN'
      END
    INTO v_nuevo_estado_compra
    FROM detalle_compra 
    WHERE id_compra = p_id_compra;

    UPDATE compra 
    SET estado = v_nuevo_estado_compra
    WHERE id_compra = p_id_compra;

    -- Registrar en auditoría
    INSERT INTO auditoria (id_usuario, accion, tabla, clave_registro, valores_anteriores, descripcion)
    VALUES (p_id_empleado, 'CREATE', 'recepcion', v_id_recepcion::TEXT, NULL, 
            'Recepción registrada desde Bodega');

  EXCEPTION WHEN OTHERS THEN
    v_error := TRUE;
    v_mensaje := 'Error al registrar recepción: ' || SQLERRM;
    RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
    RETURN;
  END;

  -- Retornar recepción creada
  RETURN QUERY 
  SELECT 
    v_id_recepcion,
    v_num_productos,
    NOW(),
    'ACT',
    v_nuevo_estado_compra,
    FALSE,
    'Recepción registrada exitosamente'::TEXT;

EXCEPTION WHEN OTHERS THEN
  v_error := TRUE;
  v_mensaje := 'Error en la base de datos: ' || SQLERRM;
  RETURN QUERY SELECT NULL, NULL, NULL, NULL, NULL, v_error, v_mensaje;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- ============================================================================
-- NOTAS PARA JAMES
-- ============================================================================

/*
PENDIENTES A IMPLEMENTAR:

1. Validar campos `error` y `mensaje` en cada SP
2. Manejar excepciones de base de datos
3. Asegurar transaccionalidad
4. Registrar auditoría apropiadamente
5. Validar integridad referencial
6. Optimizar queries
7. Agregar índices si es necesario

CONSIDERACIONES:
- Usar RAISE EXCEPTION para errores críticos
- Retornar resultados en formato TABLE
- Validar todos los parámetros de entrada
- No permitir operaciones en registros anulados/inactivos
- Mantener auditoría de operaciones
- Usar transacciones para asegurar consistencia

TESTING:
- Pruebas unitarias de cada SP
- Pruebas de integridad referencial
- Pruebas de validaciones
- Pruebas de performance
*/

