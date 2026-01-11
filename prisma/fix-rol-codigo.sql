-- Agregar campo codigo a rol con valores temporales
ALTER TABLE rol ADD COLUMN IF NOT EXISTS codigo VARCHAR(20);

-- Actualizar registros existentes con códigos basados en el id
UPDATE rol SET codigo = 'ROL_' || LPAD(id_rol::TEXT, 3, '0') WHERE codigo IS NULL;

-- Hacer el campo unique después de tener valores
ALTER TABLE rol ADD CONSTRAINT rol_codigo_key UNIQUE (codigo);
