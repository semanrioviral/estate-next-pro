-- Campos públicos del asesor por propiedad
-- Permite controlar nombre/foto visible en PDP desde el dashboard

ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS agente_nombre_publico TEXT;

ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS agente_foto_url TEXT;
