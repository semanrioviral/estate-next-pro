AUDITORÍA SEO — Inmobiliaria Tucasa Los Patios
RESUMEN EJECUTIVO
Puntuación general: 7.5/10  
Fortalezas: Structured data, sitemap dinámico, canonicals, 301 redirects  
Debilidades: Performance (force-dynamic), thin content, sin página 404, imágenes OG inexistentes
1. HALLAZGOS CRÍTICOS
1.1 No existe página 404 personalizada
- 
Archivo: app/not-found.tsx no existe
- 
Impacto: Google recibe páginas 404 sin HTML semántico, estilos ni enlaces de navegación. Esto genera soft 404s en GSC y mala experiencia de usuario.
- 
Recomendación: Crear app/not-found.tsx con metadata (noindex), enlaces a secciones principales, y diseño consistente con la marca.
1.2 Páginas con force-dynamic innecesario
Archivo
app/(public)/page.tsx:9
app/(public)/blog/page.tsx:7
app/(public)/propiedades/page.tsx:8
app/(public)/[ciudad]/page.tsx:35
app/(public)/blog/[slug]/page.tsx:18
Impacto: Fuerza SSR en cada request, incluso de bots. Esto degrada:
- 
Core Web Vitals (TTFB, LCP)
- 
Crawl budget de Googlebot
- 
Costo de cómputo en Vercel
Recomendación: Migrar a ISR con revalidate (ya usado en /propiedades/[slug] con revalidate: 300) o generateStaticParams. Las páginas de blog y ciudad son candidatas ideales para ISR.
1.3 /propiedades sin JSON-LD ni metadatos dinámicos
- 
Archivo: app/(public)/propiedades/page.tsx:10
- 
Comparado con /venta (que tiene generateMetadata dinámico + JSON-LD con CollectionPage, ItemList, BreadcrumbList, FAQPage), la página /propiedades solo tiene metadatos estáticos básicos y cero structured data.
- 
Recomendación: Implementar el mismo patrón que /venta (JSON-LD completo, FAQ schema, generateMetadata dinámico con totalCount).
2. HALLAZGOS DE ALTA PRIORIDAD
2.1 Imágenes OG referencian archivos estáticos inexistentes
Página
/venta
/venta/[ciudad]
/venta/[ciudad]/[tipo]
/blog
/propiedades/[slug]
Layout (fallback)
Impacto: Las redes sociales (WhatsApp, Facebook, Twitter) mostrarán previews sin imagen, reduciendo drásticamente el CTR en compartidos.
Recomendación: Usar la API dinámica de OG (/api/og/...) para TODAS las páginas, igual que ya se hace en propiedades y barrios. Eliminar referencias a imágenes estáticas que no existen.
2.2 barrio/[slug] usa ciudad incorrecto en generateBarrioSEO
- 
Archivo: app/(public)/barrio/[slug]/page.tsx:42
const seo = generateBarrioSEO(barrio.nombre, barrio.nombre, totalCount, slug, { siteUrl });
//                               ^^^^^^^^^^^^  ^^^^^^^^^^^^
//                               barrio        ciudad (pero se pasa barrio.nombre)
Se pasa barrio.nombre como parámetro ciudad, perdiendo la ciudad real del barrio. El breadcrumb JSON-LD generado tendrá URLs incorrectas.
Recomendación: Obtener y pasar la ciudad real del barrio (barrio.ciudad), no duplicar barrio.nombre.
2.3 /venta con index: false cuando hay < 2 propiedades
- 
Archivo: app/(public)/venta/page.tsx:42
robots: { index: properties.length >= 2, follow: true }
- 
Archivo: app/(public)/venta/[ciudad]/page.tsx:94
robots: { index: properties.length >= 2, follow: true }
- 
Archivo: app/(public)/venta/[ciudad]/[tipo]/page.tsx:103
robots: (!properties || properties.length < 2) ? { index: false, follow: true }
Impacto: Páginas con 0-1 propiedades no se indexan. Esto es correcto para evitar thin content, pero podría ser contraproducente si la página tiene contenido rico (FAQ, descripciones de ciudad). Páginas con 1 propiedad + FAQ schema + contenido descriptivo deberían indexarse.
Recomendación: Cambiar umbral a properties.length >= 1 o evaluar la calidad de contenido en lugar del número de propiedades. Al menos >= 1 para no perder tráfico de long-tail.
3. HALLAZGOS DE PRIORIDAD MEDIA
3.1 Schemas redundantes en layout + páginas
- 
Layout (app/layout.tsx:69-109): Incluye Organization + RealEstateAgent
- 
Páginas de propiedad: Incluyen RealEstateListing con su propio seller.RealEstateAgent
- 
Páginas de listado: Incluyen su propio CollectionPage + BreadcrumbList
No hay conflicto técnico (Google mergea @graph), pero es redundante. La propiedad @id se usa correctamente para cross-reference.
3.2 Página /nosotros sin OpenGraph image ni structured data
- 
Archivo: app/(public)/nosotros/page.tsx:4-10
- 
Solo tiene title, description y canonical. Sin openGraph, twitter, ni JSON-LD (AboutPage, Organization).
3.3 Páginas legales con contenido extremadamente fino
- 
/privacidad (19 líneas): Solo título + 1 frase
- 
/terminos (19 líneas): Solo título + 1 frase
Impacto: Google puede considerar estas páginas como thin content y penalizar el sitio. Aunque tengan noindex, Google a veces indexa estas páginas de todas formas si las considera importantes.
Recomendación: Expandir el contenido con política real de privacidad y términos, o al menos párrafos sustanciales. Si no se pueden expandir, asegurar que el noindex es respetado.
3.4 Filtros de ordenamiento generan URLs indexables duplicadas
Parámetros como ?orden=precio_asc, ?page=2, ?habitaciones=3 no tienen canonicals consistentes en todas las páginas. Algunas páginas (como /venta/[ciudad]/[tipo]) sí manejan canonical con ?page=, pero no con ?orden=.
Recomendación: Agregar canonical que apunte a la URL base sin parámetros de orden/filtro, o usar noindex en variantes con parámetros.
3.5 Sitemap no incluye páginas de "vender-casa-en-", "inmobiliaria-en-", ni "tag/slug"
- 
app/(public)/vender-casa-en-cucuta/page.tsx
- 
app/(public)/vender-casa-en-los-patios/page.tsx
- 
app/(public)/vender-casa-en-villa-del-rosario/page.tsx
- 
app/(public)/inmobiliaria-en-cucuta/page.tsx
- 
app/(public)/inmobiliaria-en-los-patios/page.tsx
- 
app/(public)/inmobiliaria-en-villa-del-rosario/page.tsx
- 
app/(public)/tag/[slug]/page.tsx
Estas páginas están en el sitemap (como parte de staticRoutes), pero las páginas de tag NO.
Recomendación: Verificar que todas las páginas de tag se incluyan en el sitemap.
3.6 Blog post sin og:image dinámica
- 
Archivo: app/(public)/blog/[slug]/page.tsx:27-51
- 
generateMetadata no incluye openGraph.images. Sin imagen en el preview de redes sociales.
4. HALLAZGOS DE BAJA PRIORIDAD
4.1 Sin hreflang tags
El sitio solo está en español, pero no declara hreflang="es-CO". Para un público colombiano y potencialmente venezolano, sería útil.
4.2 Títulos inconsistentes entre páginas
- 
Algunos usan title: { absolute: ... } (homepage, blog, propiedades)
- 
Otros usan title: 'string' (nosotros) → hereda el template del layout
- 
Algunos generan títulos dinámicos en generateMetadata (venta, propiedades/slug)
4.3 No hay manifest.json ni PWA
No se encontró manifest.json o app/manifest.ts. No es crítico para SEO pero sí para experiencia móvil.
4.4 Meta keywords en layout
- 
Archivo: app/layout.tsx:22
keywords: ["inmobiliaria cúcuta", "casas en venta los patios", ...]
Google ignora keywords desde 2009. No hace daño pero no aporta.
4.5 maximumScale: 5 en viewport
- 
Archivo: app/layout.tsx:58
Correcto: permite zoom al usuario (accesibilidad). No lo bloquees a 1.0.
5. COSAS QUE YA ESTÁN MUY BIEN
Elemento
JSON-LD Organization + RealEstateAgent en layout
JSON-LD RealEstateListing en propiedades
JSON-LD BreadcrumbList en propiedades y listados
JSON-LD FAQ en páginas de listado
JSON-LD BlogPosting en posts
Sitemap dinámico multi-entidad
Canonicals en todas las páginas
301 redirects de WordPress antiguo
poweredByHeader: false
compress: true
Cloudinary loader para imágenes
Font display: swap
Preconnect/dns-prefetch Cloudinary
Skip link accesibilidad
es_CO locale
Robots.txt con sitemap
6. RESUMEN DE ACCIONES RECOMENDADAS (por prioridad)
 1. 
Crear app/not-found.tsx con diseño de marca y noindex
 2. 
Migrar force-dynamic a ISR en homepage, blog, propiedades, ciudad
 3. 
Agregar JSON-LD a /propiedades (CollectionPage + ItemList + FAQ)
 4. 
Reemplazar imágenes OG estáticas por API dinámica en todas las páginas
 5. 
Corregir parámetro ciudad en barrio/[slug]/page.tsx
 6. 
Reducir umbral de noindex de 2 a 1 propiedad en páginas de listado
 7. 
Agregar og:image a /blog/[slug], /nosotros, /contacto
 8. 
Agregar canonicals consistentes para parámetros de orden/filtro
 9. 
Expandir contenido de /privacidad y /terminos
10. 
Incluir tags en el sitemap