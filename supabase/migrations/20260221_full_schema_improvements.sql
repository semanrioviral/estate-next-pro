-- ============================================================
-- MIGRACIÓN COMPLETA: Mejoras de schema properties
-- Versión: 20260221
-- Descripción:
--   - Columnas de asesor público (nombre + foto)
--   - Fix CHECK constraint tipo (permite 'comercial', 'proyecto', etc)
--   - Nuevas columnas geo, construcción, parqueaderos, moneda
--   - Nuevas columnas SEO/video
-- Seguridad: TODAS las sentencias usan IF NOT EXISTS
-- Rollback: Ver archivo rollback_20260221_full_schema_improvements.sql
-- ============================================================

BEGIN;

-- ============================================================
-- 1. CAMPOS PÚBLICOS DEL ASESOR (migración pendiente)
-- ============================================================
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS agente_nombre_publico TEXT;

ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS agente_foto_url TEXT;

-- ============================================================
-- 2. FIX CHECK CONSTRAINT DE TIPO
--    La DB actual solo permite: casa, apartamento, lote
--    El formulario y TypeScript usan: comercial, proyecto, local,
--    oficina, bodega, finca
--    Sin este fix, INSERT con tipo='comercial' da ERROR.
-- ============================================================
ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_tipo_check;

ALTER TABLE public.properties ADD CONSTRAINT properties_tipo_check
CHECK (tipo IN (
    'casa', 'apartamento', 'lote',
    'comercial', 'proyecto',
    'local', 'oficina', 'bodega', 'finca'
));

COMMENT ON CONSTRAINT properties_tipo_check ON public.properties IS
'Tipos de inmueble válidos: residencial, comercial, proyectos y lotes';

-- ============================================================
-- 3. PARQUEADEROS (columna dedicada, no embebida en servicios)
-- ============================================================
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS parqueaderos INTEGER DEFAULT 0;

-- Migrar datos existentes: extraer parqueaderos del array servicios
-- Busca entradas como "Parqueadero: 2" o "Parqueaderos: 1"
UPDATE public.properties
SET parqueaderos = COALESCE(
    (
        SELECT NULLIF(regexp_replace(s, '[^0-9]', '', 'g'), '')::INTEGER
        FROM unnest(servicios) AS s
        WHERE s ~* '^parqueaderos?:\s*\d+'
        LIMIT 1
    ),
    0
)
WHERE parqueaderos = 0
  AND servicios IS NOT NULL
  AND array_length(servicios, 1) > 0;

-- ============================================================
-- 4. GEOLOCALIZACIÓN
-- ============================================================
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS latitud NUMERIC;

ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS longitud NUMERIC;

COMMENT ON COLUMN public.properties.latitud IS 'Latitud para mapa y SEO local';
COMMENT ON COLUMN public.properties.longitud IS 'Longitud para mapa y SEO local';

-- ============================================================
-- 5. CONSTRUCCIÓN / ANTIGÜEDAD
-- ============================================================
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS año_construccion INTEGER;

ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS antigüedad TEXT;

COMMENT ON COLUMN public.properties.antigüedad IS 'Ej: Nuevo, Usado, En construcción';

-- ============================================================
-- 6. ESTRATO Y ADMINISTRACIÓN (relevante en Colombia)
-- ============================================================
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS estrato INTEGER;

ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS canon_administracion NUMERIC;

COMMENT ON COLUMN public.properties.estrato IS 'Estrato socioeconómico 1-6';
COMMENT ON COLUMN public.properties.canon_administracion IS 'Cuota de administración mensual (aptos)';

-- ============================================================
-- 7. CÓDIGO POSTAL
-- ============================================================
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS codigo_postal TEXT;

COMMENT ON COLUMN public.properties.codigo_postal IS 'Código postal para SEO local';

-- ============================================================
-- 8. MONEDA (prepara para multi-moneda)
-- ============================================================
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS moneda TEXT DEFAULT 'COP';

COMMENT ON COLUMN public.properties.moneda IS 'Moneda del precio: COP, USD';

-- Actualizar registros existentes a COP
UPDATE public.properties SET moneda = 'COP' WHERE moneda IS NULL;

-- ============================================================
-- 9. VIDEO TOUR
-- ============================================================
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS video_url TEXT;

COMMENT ON COLUMN public.properties.video_url IS 'URL de video tour (YouTube, Vimeo)';

-- ============================================================
-- 10. FECHA DE DISPONIBILIDAD
-- ============================================================
ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS fecha_disponible DATE;

COMMENT ON COLUMN public.properties.fecha_disponible IS 'Fecha estimada de disponibilidad';

-- ============================================================
-- RESUMEN: Columnas añadidas
-- ============================================================
-- ✓ agente_nombre_publico  (TEXT)
-- ✓ agente_foto_url        (TEXT)
-- ✓ parqueaderos            (INTEGER, DEFAULT 0)
-- ✓ latitud                 (NUMERIC)
-- ✓ longitud                (NUMERIC)
-- ✓ año_construccion        (INTEGER)
-- ✓ antigüedad              (TEXT)
-- ✓ estrato                 (INTEGER)
-- ✓ canon_administracion    (NUMERIC)
-- ✓ codigo_postal           (TEXT)
-- ✓ moneda                  (TEXT, DEFAULT 'COP')
-- ✓ video_url               (TEXT)
-- ✓ fecha_disponible        (DATE)
-- ✓ CHECK tipo corregido   (9 tipos válidos)

COMMIT;
