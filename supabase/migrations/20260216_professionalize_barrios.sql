-- Migration Phase 15.4: Professionalize Barrios Table
-- Purpose: Add SEO and descriptive fields to neighborhoods for local domain authority.

-- 1. Add new columns to 'barrios' if they don't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='barrios' AND column_name='descripcion') THEN
        ALTER TABLE barrios ADD COLUMN descripcion text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='barrios' AND column_name='destacado') THEN
        ALTER TABLE barrios ADD COLUMN destacado boolean DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='barrios' AND column_name='orden') THEN
        ALTER TABLE barrios ADD COLUMN orden integer DEFAULT 0;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='barrios' AND column_name='meta_titulo') THEN
        ALTER TABLE barrios ADD COLUMN meta_titulo text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='barrios' AND column_name='meta_descripcion') THEN
        ALTER TABLE barrios ADD COLUMN meta_descripcion text;
    END IF;
END $$;

-- 2. Seed real neighborhoods of Los Patios
-- Usando lógica de slugify para la columna slug
INSERT INTO barrios (nombre, slug, ciudad, destacado, orden)
VALUES 
-- Centro y aledaños
('Patios Centro', 'patios-centro', 'Los Patios', true, 1),
('Patio Antiguo', 'patio-antiguo', 'Los Patios', true, 2),
('Once de Noviembre', 'once-de-noviembre', 'Los Patios', false, 3),
-- Zona Iscaliguá
('Iscaligua I', 'iscaligua-i', 'Los Patios', false, 4),
('Iscaligua II', 'iscaligua-ii', 'Los Patios', false, 5),
('La Campiña', 'la-campiña', 'Los Patios', true, 6),
('Los Colorados', 'los-colorados', 'Los Patios', false, 7),
('San Carlos', 'san-carlos', 'Los Patios', false, 8),
-- Zona Kilómetros
('Kilómetro Ocho', 'kilometro-ocho', 'Los Patios', true, 9),
('Kilómetro Nueve', 'kilometro-nueve', 'Los Patios', false, 10),
-- Sector Occidental
('La Sabana', 'la-sabana', 'Los Patios', true, 11),
('La Cordialidad', 'la-cordialidad', 'Los Patios', false, 12),
('Sinahí', 'sinahi', 'Los Patios', false, 13),
('Doce de Octubre', 'doce-de-octubre', 'Los Patios', false, 14),
('El Chaparral', 'el-chaparral', 'Los Patios', false, 15),
('Villa Betania', 'villa-betania', 'Los Patios', false, 16),
-- Sector Sur/Oriental
('Juana Paula', 'juana-paula', 'Los Patios', false, 17),
('Betania', 'betania', 'Los Patios', false, 18),
('San Fernando', 'san-ferando', 'Los Patios', false, 19),
('San Francisco', 'san-francisco', 'Los Patios', false, 20),
('San Remo', 'san-remo', 'Los Patios', false, 21),
('Santa Ana', 'santa-ana', 'Los Patios', false, 22),
('La Floresta', 'la-floresta', 'Los Patios', true, 23),
-- Urbanizaciones
('Videlso', 'videlso', 'Los Patios', true, 24),
('Torres de Villa de San Diego', 'torres-de-villa-de-san-diego', 'Los Patios', true, 25),
('Villa Sonia', 'villa-sonia', 'Los Patios', false, 26),
('Villa Camila', 'villa-camila', 'Los Patios', false, 27),
('Pinar del Río', 'pinar-del-rio', 'Los Patios', true, 28)
ON CONFLICT (slug) DO UPDATE 
SET destacado = EXCLUDED.destacado,
    orden = EXCLUDED.orden;

-- 3. Add index for featured barrios performance
CREATE INDEX IF NOT EXISTS idx_barrios_destacado_orden ON barrios (destacado DESC, orden ASC);
