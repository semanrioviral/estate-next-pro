-- ============================================================
-- ROLLBACK: Revierte la migración 20260221_full_schema_improvements
-- Uso:  Ejecuta SOLO si necesitas deshacer los cambios.
--        NO pierde datos (DROP COLUMN preserva datos si se
--        vuelven a añadir, pero no los restaurará automágicamente).
-- ============================================================
-- ⚠️ ADVERTENCIA: Ejecuta solo si hay problemas graves.
--    Normalmente no deberías necesitar esto.
-- ============================================================

BEGIN;

-- 1. Volver al CHECK constraint original (solo 3 tipos)
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_tipo_check;
ALTER TABLE public.properties ADD CONSTRAINT properties_tipo_check
CHECK (tipo IN ('casa', 'apartamento', 'lote'));

-- 2. Eliminar columnas nuevas
ALTER TABLE public.properties DROP COLUMN IF EXISTS agente_nombre_publico;
ALTER TABLE public.properties DROP COLUMN IF EXISTS agente_foto_url;
ALTER TABLE public.properties DROP COLUMN IF EXISTS parqueaderos;
ALTER TABLE public.properties DROP COLUMN IF EXISTS latitud;
ALTER TABLE public.properties DROP COLUMN IF EXISTS longitud;
ALTER TABLE public.properties DROP COLUMN IF EXISTS año_construccion;
ALTER TABLE public.properties DROP COLUMN IF EXISTS antigüedad;
ALTER TABLE public.properties DROP COLUMN IF EXISTS estrato;
ALTER TABLE public.properties DROP COLUMN IF EXISTS canon_administracion;
ALTER TABLE public.properties DROP COLUMN IF EXISTS codigo_postal;
ALTER TABLE public.properties DROP COLUMN IF EXISTS moneda;
ALTER TABLE public.properties DROP COLUMN IF EXISTS video_url;
ALTER TABLE public.properties DROP COLUMN IF EXISTS fecha_disponible;

COMMIT;
