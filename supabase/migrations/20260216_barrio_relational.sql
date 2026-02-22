-- ====================================================
-- PHASE 7: BARRIO RELATIONAL MIGRATION
-- ====================================================
-- Fecha: 2026-02-16
-- Propósito: Convertir barrio en una relación real
-- ====================================================

-- 1. Asegurar columna barrio_id en properties (si no existe)
ALTER TABLE public.properties 
ADD COLUMN IF NOT EXISTS barrio_id UUID REFERENCES public.barrios(id) ON DELETE SET NULL;

-- 2. Crear índice para performance en filtrados por barrio
CREATE INDEX IF NOT EXISTS idx_properties_barrio_id ON public.properties(barrio_id);

-- 3. Comentario descriptivo
COMMENT ON COLUMN public.properties.barrio_id IS 'Relación con la tabla profesional de barrios para SEO y consistencia';

-- 4. Registro de auditoría (opcional)
-- DO $$ 
-- BEGIN 
--   RAISE NOTICE 'Migration for barrio_id relation completed.';
-- END $$;
