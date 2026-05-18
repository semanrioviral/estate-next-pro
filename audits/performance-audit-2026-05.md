AUDITORIA DE RENDIMIENTO COMPLETO
tucasalospatios.com — Inmobiliaria Tucasa Los Patios
RESUMEN EJECUTIVO
Métrica	Home (mobile)	Catálogo (mobile)
Performance Score	93	88
LCP	3.0s	3.1s
CLS	0	0.118
TBT	120ms	150ms
FCP	1.0s	1.2s
Speed Index	3.6s	2.0s
TTI	~5s	~5s
SEO: 100/100 | Best Practices: 100/100 | Accessibility: 89-95/100
1. CRITICO — Imagen hero preloaded en TODAS las paginas
Problema: app/layout.tsx:116 hace preload incondicional de la imagen del hero (f_webp,q_40,w_400, ~21KB) en el <head> global. Esta imagen se descarga en todas las paginas (blog, admin, contacto, propiedad, etc.), desperdiciando ancho de banda y contaminando el cache del navegador.
Impacto: Alto — ~21KB desperdiciados por cada visita a pagina no-home (80% del trafico). En mobile con 4G, son 200-400ms adicionales de descarga innecesaria.
Core Web Vital afectado: LCP (compite por ancho de banda con el LCP real de la pagina)
Archivo: app/layout.tsx:116
Solucion: Mover el preload al <head> de la pagina home (app/(public)/page.tsx) usando next/head o un layout especifico. Alternativa: eliminar el preload y dejar que priority en <Image> maneje la carga.
Impacto esperado: -200ms LCP en paginas no-home, reduccion de datos en ~80% de pageviews.
2. CRITICO — CLS 0.118 en catalogo /venta
Problema: La pagina de catalogo tiene CLS de 0.118 (needs improvement). Las PropertyCard usan h-[480px] lg:h-[490px] con altura fija, pero la seccion de trending/catalog se monta despues del fetch de datos de Supabase sin skeleton previo. Al no haber loading.tsx, la pagina se pinta progresivamente causando shift.
Impacto: Alto — CLS > 0.1 degrada Core Web Vitals y puede afectar ranking SEO.
Core Web Vital afectado: CLS
Archivos: app/(public)/venta/page.tsx, app/(public)/arriendo/page.tsx, paginas de catalogo similares
Solucion: Agregar skeletons o un loading.tsx con grid de placeholders de altura fija que coincida con las PropertyCards finales. El grid de skeletons debe tener las mismas dimensiones (h-[480px]) que los cards reales.
Impacto esperado: CLS → 0.00 en paginas de catalogo.
3. ALTO — force-dynamic en paginas SEO-criticas
Problema: 10 paginas usan force-dynamic, incluyendo la home, catalogo principal, blog, y paginas de ciudad. Esto deshabilita completamente el cache HTTP de Next.js (el Cache-Control se configura como no-store, must-revalidate). Cada request ejecuta el render completo del servidor + consultas a Supabase.
Paginas afectadas:
Pagina	Archivo
Home /	app/(public)/page.tsx:9
/propiedades	app/(public)/propiedades/page.tsx:8
/blog	app/(public)/blog/page.tsx:7
/blog/[slug]	app/(public)/blog/[slug]/page.tsx:18
/[ciudad]	app/(public)/[ciudad]/page.tsx:35
Admin pages (5)	app/admin/**/page.tsx
La capa de datos SI tiene unstable_cache con revalidacion (3600s para propiedades), pero el render del servidor igual se ejecuta cada vez porque force-dynamic lo impone a nivel pagina.
Impacto: Alto — TTFB innecesariamente alto, especialmente en la home (pagina mas visitada). Cada request reconstruye el JSX completo aunque los datos esten cacheados.
Core Web Vital afectado: TTFB, LCP (indirectamente)
Solucion para la home: Cambiar a export const revalidate = 3600; (ISR 1 hora) combinado con generateStaticParams para la home. Los datos ya estan cacheados via unstable_cache, el render tambien deberia estarlo. Usar revalidatePath('/') en admin actions al crear/editar propiedades para invalidar.
Solucion para catalogo: ISR con revalidate = 300 + stale-while-revalidate via Vercel headers.
Solucion para blog: ISR con revalidate = 60 ya que los datos tienen caché de 1-60s.
Solucion para admin: Mantener force-dynamic — es necesario por autenticacion.
Impacto esperado: TTFB -50ms a -200ms en home y paginas de catalogo. Reduccion de carga en servidor.
4. ALTO — Meta Pixel: 127KB de JS con solo 28% utilizado
Problema: El script de Meta Pixel (fbevents.js + script de config) suma ~228KB de JS (127KB + 101KB), de los cuales solo se usa el 28-32%. El tiempo de ejecucion JS total es 1,211ms, con 454ms en inline scripts y 195ms en el script de Meta.
Impacto: Alto — 228KB descargados, 280ms de CPU en mobile. Es el recurso mas pesado de toda la pagina (31% del JS total).
Core Web Vital afectado: TBT, TTI, INP
Archivos: app/layout.tsx:126-156
Solucion: El Pixel ya esta cargado con strategy="lazyOnload", lo cual es correcto. Opciones adicionales:
1. 
Usar next/script con strategy="worker" (Partytown) para mover el Pixel a un Web Worker
2. 
Evaluar si se necesita realmente el Meta Pixel en todas las paginas (actualmente se carga en todas)
3. 
Implementar next/script con dangerouslySetInnerHTML minimizando el inline script
Impacto esperado: TBT -50ms a -100ms en mobile.
5. ALTO — No hay loading.tsx en ninguna ruta
Problema: El proyecto tiene 0 archivos loading.tsx y solo 2 Suspense manuales (FeaturedProperties y SearchBarV3). En conexiones lentas, las transiciones entre paginas no muestran feedback visual, causando percepcion de lentitud y potencial CLS cuando el contenido finalmente carga.
Impacto: Medio-Alto — Experiencia de usuario degradada en 3G/4G lento. Posible CLS en navegacion.
Archivos afectados: Todas las rutas (app/(public)/**/page.tsx)
Solucion: Crear loading.tsx para:
- 
/venta/loading.tsx — grid de skeletons de PropertyCard
- 
/propiedades/loading.tsx — skeleton de pagina de detalle
- 
/blog/loading.tsx — skeleton de articulo
Impacto esperado: CLS eliminado en navegacion, mejor UX percibida.
6. MEDIO — app/(public)/layout.tsx es Client Component
Problema: El layout publico usa "use client" para acceder a usePathname(). Esto significa que todo el arbol de componentes publicos (NavbarV3, FooterV3, WhatsAppFloatingButton) se incluye en el bundle de JS del cliente en cada pagina. El layout en si es ligero (solo condiciona pt-0 vs pt-20), pero fuerza que sus imports sean client-side.
Impacto: Medio — Agrega ~5-10KB al bundle JS del cliente y requiere hidratacion de NavbarV3 + FooterV3 + WhatsAppButton.
Core Web Vital afectado: TBT (hidratacion), TTI
Archivos: app/(public)/layout.tsx
Solucion: Separar en dos layouts: un layout principal server component que envuelve children, y un wrapper client component especifico solo para NavbarV3 + FooterV3 + WhatsAppFloatingButton. El main con pt-0/pt-20 puede manejarse con CSS condicional o un Client Component minimo.
Alternativa: mover la deteccion de isHome a CSS (padding-top condicional basado en una clase en <body>) o a un cookies()/headers() server-side.
Impacto esperado: -5KB a -8KB de JS enviado al cliente. Menor tiempo de hidratacion.
7. MEDIO — PropertyGallery: todas las miniaturas con loading="eager"
Problema: En PropertyGallery.tsx:450, todas las miniaturas del carrusel usan loading="eager", lo que fuerza la descarga de todas las imagenes de la galeria en el primer render. En una propiedad con 10+ fotos, esto son muchas descargas simultaneas innecesarias (las miniaturas estan below-the-fold).
Impacto: Medio — Ancho de banda desperdiciado, LCP compite con descargas de miniaturas.
Core Web Vital afectado: LCP (contiende por ancho de banda)
Archivos: components/PropertyGallery.tsx:450
Solucion: Cambiar miniaturas a loading="lazy" (solo la primera visible deberia ser eager). Mantener loading="eager" solo en la imagen principal.
Impacto esperado: LCP -100ms a -200ms en paginas de detalle con muchas fotos.
8. MEDIO — Importaciones no usadas en layout raiz
Problema: app/layout.tsx:5-6 importa Navbar (legacy) y Footer (legacy) que nunca se renderizan en el JSX. Aunque probablemente son tree-shaken por el bundler, contaminan el grafo de modulos y podrian incluirse accidentalmente.
Impacto: Bajo-Medio — Tree-shaking deberia eliminarlos, pero es codigo muerto confuso.
Archivos: app/layout.tsx:5-6
Solucion: Eliminar los imports de Navbar y Footer.
9. MEDIO — SearchBarV3: fetch client-side de barrios
Problema: SearchBarV3.tsx:82-102 hace un fetch a Supabase desde el cliente cada vez que se selecciona una ciudad. Esto introduce una cascada de red: usuario selecciona ciudad → espera fetch de barrios → puede seleccionar barrio. El componente se renderiza en el servidor pero el fetch de barrios es client-side.
Impacto: Medio — Latencia percibida en la interaccion de busqueda.
Core Web Vital afectado: INP (interaccion lenta en busqueda)
Archivos: components/design-system/SearchBarV3.tsx:82-102, lib/supabase/client-queries.ts
Solucion: Pre-fetch de barrios en el servidor usando unstable_cache y pasarlos como prop a SearchBarV3, o hacer el fetch inicial en el servidor con streaming.
Impacto esperado: Interaccion de busqueda instantanea al cambiar de ciudad.
10. MEDIO — Pagina de catalogo duplica data fetching
Problema: En /venta/page.tsx, tanto generateMetadata() como el componente VentaPage() llaman a getPropertiesByOperacion() independientemente. Aunque unstable_cache evita la consulta duplicada a BD, ambas invocaciones ejecutan logica de mapeo JS y serializacion en el servidor.
Impacto: Medio — Duplica el trabajo de CPU del servidor por request.
Core Web Vital afectado: TTFB
Archivos: app/(public)/venta/page.tsx:20-24 y :73-74
Solucion: Usar React.cache() alrededor de un wrapper unificado, o mover el conteo a una consulta SQL liviana separada (COUNT(*)) para metadata.
Impacto esperado: TTFB -20ms a -50ms en paginas de catalogo.
11. BAJO — Fuente Outfit: 4 pesos cargados via Google Fonts
Problema: app/layout.tsx:8-13 carga 4 pesos (400, 500, 600, 700) de Outfit via Google Fonts. El peso 500 se usa poco. La fuente se descarga de Google (~32KB woff2) en vez de ser self-hosted.
Impacto: Bajo — 32KB de fuente con 1 request externo adicional.
Core Web Vital afectado: FCP (bloquea renderizado de texto)
Archivos: app/layout.tsx:8-13
Solucion: Eliminar peso 500 si no se usa sustancialmente. Considerar self-hosting con next/font/local para eliminar el request externo a Google Fonts.
Impacto esperado: -8KB de descarga, -1 request externo.
12. BAJO — CSS: clases utilitarias repetidas con @apply
Problema: globals.css define container-wide, btn-primary, btn-secondary, input-standard como @utility. Tailwind v4 transforma cada @apply en CSS generado. Las clases utilitarias con muchas propiedades generan CSS repetido cuando se usan text-[10px], font-black, uppercase, tracking-widest (combinacion muy frecuente en el proyecto).
Impacto: Bajo — CSS total son solo ~17.7KB (muy eficiente ya). Lighthouse reporta "Reduce unused CSS" pero el margen es pequeno para Tailwind v4.
Core Web Vital afectado: FCP (CSS bloquea render)
Archivos: app/globals.css, multiples componentes
Solucion: Tailwind v4 con JIT ya es eficiente. Si se quiere optimizar mas: extraer la combinacion text-[10px] font-black uppercase tracking-widest como @utility label-micro para reducir CSS generado.
13. BAJO — unstable_cache usa API legacy de Next.js
Problema: El proyecto usa unstable_cache extensivamente, que es una API marcada como inestable en Next.js 16. La nueva API cacheTag/cacheLife es la recomendada. Aunque funcional, unstable_cache podria cambiar en futuras versiones.
Impacto: Bajo — Funciona correctamente hoy, riesgo futuro de breaking change.
Archivos: lib/supabase/properties.ts, lib/supabase/blog.ts, app/api/facebook-feed/route.ts, app/(public)/propiedades/[slug]/page.tsx
Solucion: Migrar a use cache (directiva de cache en Next.js 16) combinado con cacheTag() para invalidacion.
14. BAJO — Sin stale-while-revalidate en headers
Problema: Las paginas ISR (propiedades/[slug], barrio/[slug]) usan revalidate: 300 pero no configuran stale-while-revalidate en CDN/Vercel. Esto significa que si el cache expira, el siguiente usuario espera el rebuild completo (bloqueante).
Impacto: Bajo — Solo afecta al primer usuario despues de la expiracion del cache.
Archivos: next.config.ts, o headers en paginas ISR
Solucion: Agregar header Cache-Control: s-maxage=300, stale-while-revalidate=60 via Vercel o configuracion de ruta.
15. BAJO — Header sin cache publico en paginas force-dynamic
Problema: Las paginas con force-dynamic envian Cache-Control: private, no-cache, no-store, must-revalidate, lo que impide cualquier cache HTTP incluso cuando los datos subyacentes estan cacheados por horas.
Impacto: Bajo — Sirve datos frescos pero a costa de TTFB.
Solucion mencionada en punto #3.
VERIFICACION POSITIVA — Lo que YA esta bien optimizado
Aspecto	Estado
No render-blocking resources	0 detectados
CLS en home y detalle	0.000 — perfecto
SEO score	100/100 en todas las paginas
Best Practices	100/100
next.config.ts	compress: true, poweredByHeader: false, optimizePackageImports configurado
Cloudinary loader	Custom loader con f_auto,q_auto en todas las imagenes
next/dynamic	5 componentes lazy-loaded en pagina de detalle
React.cache()	Deduplicacion de fetches por request
unstable_cache	Cache de datos con tags y revalidacion apropiada
Middleware	Solo autentica en /admin, ignora rutas publicas
Meta Pixel	strategy="lazyOnload" — correcto
Imagenes homepage cards	f_webp,q_50,w_400 + unoptimized — agresivamente optimizadas
priority en LCP	Hero image y primera imagen de galeria correctamente priorizadas
Font display: swap	Previene FOIT
Sin librerias pesadas	Sin GSAP, framer-motion, lodash, moment, o state managers
Embla Carousel	Tree-shaken via optimizePackageImports
RESUMEN DE PRIORIDADES
#	Problema	Severidad
1	Hero preload global innecesario	Critico
2	CLS 0.118 en catalogo	Critico
3	force-dynamic en paginas SEO	Alto
4	Meta Pixel ~228KB / 280ms CPU	Alto
5	Sin loading.tsx	Alto
6	(public)/layout.tsx Client	Medio
7	Miniaturas todas eager	Medio
8	Importaciones legacy sin uso	Medio
9	Barrios fetch client-side	Medio
10	Doble fetch en catalogo	Medio
11	Fuente con 4 pesos	Bajo
12	CSS repetido @apply	Bajo
Ganancia total estimada: LCP movil de 3.0s → ~2.2s, CLS catalogo → 0, TBT -100ms.