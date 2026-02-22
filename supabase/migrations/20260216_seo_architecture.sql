-- ====================================================
-- SEO DATABASE ARCHITECTURE MIGRATION
-- ====================================================
-- Fecha: 2026-02-16
-- Propósito: Agregar tablas para arquitectura SEO escalable
-- IMPORTANTE: No modifica tablas existentes
-- ====================================================

-- 1. TAGS TABLE
-- Tabla para almacenar etiquetas con metadata SEO
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  meta_titulo TEXT,
  meta_descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice en slug para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_tags_slug ON public.tags(slug);

-- 2. PROPERTY_TAGS JUNCTION TABLE
-- Relación muchos a muchos entre properties y tags
CREATE TABLE IF NOT EXISTS public.property_tags (
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES public.tags(id) ON DELETE CASCADE,
  PRIMARY KEY (property_id, tag_id)
);

-- 3. BARRIOS TABLE
-- Tabla para barrios con slug SEO-friendly
CREATE TABLE IF NOT EXISTS public.barrios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  ciudad TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice en slug para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_barrios_slug ON public.barrios(slug);

-- 4. AMENIDADES TABLE
-- Tabla catálogo de amenidades
CREATE TABLE IF NOT EXISTS public.amenidades (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL
);

-- Índice en slug para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_amenidades_slug ON public.amenidades(slug);

-- 5. PROPERTY_AMENIDADES JUNCTION TABLE
-- Relación muchos a muchos entre properties y amenidades
CREATE TABLE IF NOT EXISTS public.property_amenidades (
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  amenidad_id UUID REFERENCES public.amenidades(id) ON DELETE CASCADE,
  PRIMARY KEY (property_id, amenidad_id)
);

-- ====================================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================================

-- Habilitar RLS en todas las nuevas tablas
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.barrios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.amenidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_amenidades ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: Lectura pública para todos
DROP POLICY IF EXISTS "Tags are viewable by everyone" ON public.tags;
CREATE POLICY "Tags are viewable by everyone" ON public.tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Property tags are viewable by everyone" ON public.property_tags;
CREATE POLICY "Property tags are viewable by everyone" ON public.property_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "Barrios are viewable by everyone" ON public.barrios;
CREATE POLICY "Barrios are viewable by everyone" ON public.barrios FOR SELECT USING (true);

DROP POLICY IF EXISTS "Amenidades are viewable by everyone" ON public.amenidades;
CREATE POLICY "Amenidades are viewable by everyone" ON public.amenidades FOR SELECT USING (true);

DROP POLICY IF EXISTS "Property amenidades are viewable by everyone" ON public.property_amenidades;
CREATE POLICY "Property amenidades are viewable by everyone" ON public.property_amenidades FOR SELECT USING (true);

-- POLÍTICAS: Escritura solo para admin/agentes
DROP POLICY IF EXISTS "Admins can manage tags" ON public.tags;
CREATE POLICY "Admins can manage tags" ON public.tags FOR ALL USING ( public.is_admin() );

DROP POLICY IF EXISTS "Agents can manage property_tags" ON public.property_tags;
CREATE POLICY "Agents can manage property_tags" ON public.property_tags FOR ALL USING ( public.is_agent_or_admin() );

DROP POLICY IF EXISTS "Admins can manage barrios" ON public.barrios;
CREATE POLICY "Admins can manage barrios" ON public.barrios FOR ALL USING ( public.is_admin() );

DROP POLICY IF EXISTS "Admins can manage amenidades" ON public.amenidades;
CREATE POLICY "Admins can manage amenidades" ON public.amenidades FOR ALL USING ( public.is_admin() );

DROP POLICY IF EXISTS "Agents can manage property_amenidades" ON public.property_amenidades;
CREATE POLICY "Agents can manage property_amenidades" ON public.property_amenidades FOR ALL USING ( public.is_agent_or_admin() );

-- ====================================================
-- FIN DE MIGRACIÓN
-- ====================================================
-- Verificar que todas las tablas se crearon correctamente:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('tags', 'property_tags', 'barrios', 'amenidades', 'property_amenidades');
