-- Agregar estado a carrito_detalle
ALTER TABLE carrito_detalle ADD COLUMN estado CHAR(3) DEFAULT 'ACT';

-- Agregar estado a detalle_compra
ALTER TABLE detalle_compra ADD COLUMN estado CHAR(3) DEFAULT 'ACT';

-- Agregar estado a detalle_recepcion
ALTER TABLE detalle_recepcion ADD COLUMN estado CHAR(3) DEFAULT 'ACT';

-- Agregar estado a factura_detalle
ALTER TABLE factura_detalle ADD COLUMN estado CHAR(3) DEFAULT 'ACT';

-- Agregar estado a producto_favorito
ALTER TABLE producto_favorito ADD COLUMN estado CHAR(3) DEFAULT 'ACT';
