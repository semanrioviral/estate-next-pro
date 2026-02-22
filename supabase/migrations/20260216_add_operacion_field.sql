-- ====================================================
-- PHASE 6.1: ADD OPERACION FIELD (Venta / Arriendo)
-- ====================================================
-- Fecha: 2026-02-16
-- Propósito: Distinguir inventario de venta y arriendo
-- ====================================================

-- 1. Agregar columna operacion
-- Se agrega inicialmente con DEFAULT 'venta'
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS operacion TEXT DEFAULT 'venta';

-- 2. Migrar registros existentes (por seguridad)
UPDATE public.properties 
SET operacion = 'venta' 
WHERE operacion IS NULL;

-- 3. Aplicar restricciones NOT NULL y CHECK
ALTER TABLE public.properties 
ALTER COLUMN operacion SET NOT NULL;

ALTER TABLE public.properties 
ADD CONSTRAINT check_operacion_type 
CHECK (operacion IN ('venta', 'arriendo'));

-- 4. Crear índice para optimizar filtrado
CREATE INDEX IF NOT EXISTS idx_properties_operacion 
ON public.properties(operacion);

-- Comentario descriptivo
COMMENT ON COLUMN public.properties.operacion IS 'Tipo de operación: venta o arriendo';
