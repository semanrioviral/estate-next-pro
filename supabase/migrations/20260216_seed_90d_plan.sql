-- Seeding the 90-Day SEO Editorial Plan
-- Phase 17: SEO Blog Automation Engine

DO $$
DECLARE
    now_ts TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
    -- MES 1
    
    -- Semana 01 (Publicada hoy)
    INSERT INTO blog_posts (titulo, slug, content, content_md, contenido, categoria, status, published_at, ciudad)
    VALUES (
        'Guía Definitiva: ¿Cómo comprar casa en Cúcuta paso a paso? (2026)',
        'comprar-casa-en-cucuta-2026',
        '', '', -- campos antiguos
        '## Introducción al Mercado de Cúcuta\nComprar casa en Cúcuta en 2026 requiere estrategia. Con la reapertura total de fronteras y nuevos proyectos viales, la ciudad está en su mejor momento inmobiliario.\n\n## Paso 1: Presupuesto y Crédito\nLo primero es saber cuánto puedes pagar. Consulta sobre [crédito hipotecario](file:///blog/credito-hipotecario-los-patios-2026) y si eres militar, revisa cómo usar [Caja Honor](file:///blog/tag/caja-honor).\n\n## Paso 2: Ubicación Estratégica\nNo es lo mismo vivir en Prados del Este que en Los Patios. Revisa nuestras opciones de [casas en venta en Cúcuta](file:///venta/cucuta).\n\n## Paso 3: Documentación Legal\nVerifica siempre el Certificado de Tradición y Libertad. Si necesitas ayuda, nuestro equipo puede asesorarte para [vender o comprar](file:///vender-casa-en-cucuta) con seguridad.\n\n## Conclusión\nCúcuta ofrece rentabilidad y calidad de vida. No esperes más para invertir.',
        'Guías de Compra',
        'published',
        now_ts,
        'Cúcuta'
    ) ON CONFLICT (slug) DO NOTHING;

    -- Semana 02 (Programada para +7 días)
    INSERT INTO blog_posts (titulo, slug, content, content_md, contenido, categoria, status, published_at, ciudad)
    VALUES (
        'Crédito Hipotecario en Los Patios: Bancos y Tasas 2026',
        'credito-hipotecario-los-patios-2026',
        '', '',
        '## Financiación en Los Patios\nEl acceso a crédito es vital. En 2026 las tasas han bajado un 2% comparado al año anterior.\n\n## Mejores Bancos locales\nAnalizamos la oferta de Bancolombia, Davivienda y BBVA para el sector de Pinar del Río y Tierra Linda.\n\n## Conclusión\nPlanifica tu cuota mensual hoy.',
        'Financiero',
        'scheduled',
        now_ts + INTERVAL '7 days',
        'Los Patios'
    ) ON CONFLICT (slug) DO NOTHING;

    -- Semana 03 (+14 días)
    INSERT INTO blog_posts (titulo, slug, content, content_md, contenido, categoria, status, published_at, ciudad)
    VALUES (
        'Los 5 mejores barrios para vivir en Villa del Rosario hoy',
        'mejores-barrios-villa-del-rosario',
        '', '',
        '## Vivir cerca de la historia\nVilla del Rosario no es solo turismo, es un hub residencial en crecimiento.\n\n## Top 5 Barrios\n1. La Parada (Comercial)\n2. Centro\n3. Lomitas\n4. San Gregorio\n5. Gran Colombia.\n\n## Mercado de Vivienda\nRevisa [casas en venta](file:///venta) en nuestra plataforma.',
        'Ubicación',
        'scheduled',
        now_ts + INTERVAL '14 days',
        'Villa del Rosario'
    ) ON CONFLICT (slug) DO NOTHING;

    -- Semana 04 (+21 días)
    INSERT INTO blog_posts (titulo, slug, content, content_md, contenido, categoria, status, published_at, ciudad)
    VALUES (
        'Cómo usar tu subsidio de Caja Honor para vivienda usada',
        'usar-subsidio-caja-honor-vivienda-usada',
        '', '',
        '## Beneficios para Héroes\nMuchos militares no saben que pueden comprar vivienda usada con su fondo de vivienda.\n\n## Requisitos en Cúcuta\nExplicamos los pasos para Los Patios y Cúcuta.',
        'Financiero',
        'scheduled',
        now_ts + INTERVAL '21 days',
        'Cúcuta'
    ) ON CONFLICT (slug) DO NOTHING;

    -- MES 2
    
    -- Semana 05 (+28 días)
    INSERT INTO blog_posts (titulo, slug, content, content_md, contenido, categoria, status, published_at, ciudad)
    VALUES (
        '¿Cuánto vale mi casa? Guía de avalúos en Los Patios',
        'cuanto-vale-mi-casa-los-patios',
        '', '',
        '## Valora tu patrimonio\nSaber el precio real es el primer paso para una venta exitosa.',
        'Propietarios',
        'scheduled',
        now_ts + INTERVAL '28 days',
        'Los Patios'
    ) ON CONFLICT (slug) DO NOTHING;

    -- Semana 06 (+35 días)
    INSERT INTO blog_posts (titulo, slug, content, content_md, contenido, categoria, status, published_at, ciudad)
    VALUES (
        '7 consejos para vender tu propiedad rápido en Norte de Santander',
        'vender-propiedad-norte-de-santander',
        '', '',
        '## Venta Profesional\nDesde el home staging hasta la fotografía con drones.',
        'Propietarios',
        'scheduled',
        now_ts + INTERVAL '35 days',
        'Cúcuta'
    ) ON CONFLICT (slug) DO NOTHING;

    -- Semana 07 (+42 días)
    INSERT INTO blog_posts (titulo, slug, content, content_md, contenido, categoria, status, published_at, ciudad)
    VALUES (
        'Proyectos de infraestructura que subirán el precio en Cúcuta',
        'infraestructura-que-subira-precios-cucuta',
        '', '',
        '## Valorización 2026\nNuevos puentes y centros comerciales que cambian el mapa inmobiliario.',
        'Mercado Local',
        'scheduled',
        now_ts + INTERVAL '42 days',
        'Cúcuta'
    ) ON CONFLICT (slug) DO NOTHING;

    -- Semana 08 (+49 días)
    INSERT INTO blog_posts (titulo, slug, content, content_md, contenido, categoria, status, published_at, ciudad)
    VALUES (
        'Documentos legales necesarios para vender casa en 2026',
        'documentos-para-vender-casa-2026',
        '', '',
        '## Trámites sin complicaciones\nEscrituras, paz y salvos y certificados requeridos.',
        'Propietarios',
        'scheduled',
        now_ts + INTERVAL '49 days',
        'Cúcuta'
    ) ON CONFLICT (slug) DO NOTHING;

    -- MES 3

    -- Semana 09 (+56 días)
    INSERT INTO blog_posts (titulo, slug, content, content_md, contenido, categoria, status, published_at, ciudad)
    VALUES (
        'Rentabilidad por alquiler en Cúcuta vs Los Patios: Análisis',
        'rentabilidad-alquiler-cucuta-vs-los-patios',
        '', '',
        '## ROI Inmobiliario\n¿Dónde deja más dinero tu inversión hoy?',
        'Financiero',
        'scheduled',
        now_ts + INTERVAL '56 days',
        'Los Patios'
    ) ON CONFLICT (slug) DO NOTHING;

    -- Semana 10 (+63 días)
    INSERT INTO blog_posts (titulo, slug, content, content_md, contenido, categoria, status, published_at, ciudad)
    VALUES (
        'Por qué invertir en lotes de engorde en Villa del Rosario',
        'invertir-en-lotes-villa-del-rosario',
        '', '',
        '## Tierra: El activo más seguro\nZonas de expansión urbana en el municipio histórico.',
        'Inversión',
        'scheduled',
        now_ts + INTERVAL '63 days',
        'Villa del Rosario'
    ) ON CONFLICT (slug) DO NOTHING;

    -- Semana 11 (+70 días)
    INSERT INTO blog_posts (titulo, slug, content, content_md, contenido, categoria, status, published_at, ciudad)
    VALUES (
        'La ventaja de vivir en un conjunto cerrado en Tierra Linda',
        'vivir-en-conjunto-cerrado-tierra-linda',
        '', '',
        '## Seguridad y Estilo de Vida\nAnálisis de los mejores conjuntos de Los Patios.',
        'Estilo de Vida',
        'scheduled',
        now_ts + INTERVAL '70 days',
        'Los Patios'
    ) ON CONFLICT (slug) DO NOTHING;

    -- Semana 12 (+77 días)
    INSERT INTO blog_posts (titulo, slug, content, content_md, contenido, categoria, status, published_at, ciudad)
    VALUES (
        'Resumen del mercado inmobiliario regional 2026 (Q1)',
        'mercado-inmobiliario-cucuta-2026-q1',
        '', '',
        '## Cierre de Trimestre\nCómo se comportaron los precios y qué esperar para el resto del año.',
        'Autoridad',
        'scheduled',
        now_ts + INTERVAL '77 days',
        'Cúcuta'
    ) ON CONFLICT (slug) DO NOTHING;

END $$;
