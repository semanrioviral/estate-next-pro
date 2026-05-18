# Inmobiliaria Tucasa Los Patios

> Plataforma web de propiedades inmobiliarias en venta y arriendo en Norte de Santander, Colombia.
> **Sitio en vivo:** https://tucasalospatios.com

---

## Tech Stack

| Capa | Tecnología |
|---|---|
| Framework | **Next.js 16.2.6** (App Router) |
| UI Library | **React 19.2.3** |
| Estilos | **Tailwind CSS 4** con configuración inline en `globals.css` |
| Lenguaje | **TypeScript 5** |
| Base de datos | **Supabase** (PostgreSQL) via `@supabase/ssr` + `@supabase/supabase-js` |
| Imágenes | **Cloudinary** (`cloudinary` npm package) |
| Iconos | **Lucide React** (`lucide-react` v0.563) |
| Carousel | **Embla Carousel** (`embla-carousel-react` v8.6) |
| Drag & Drop | **dnd-kit** (admin panel) |
| Deployment | **Vercel** |
| SEO | Next.js Metadata API, JSON-LD estructurado, Sitemap dinámico, Image Sitemap, OG Images dinámicas |

---

## Estructura del Proyecto

```
estate-next-pro/
├── app/
│   ├── (public)/                    ← Páginas públicas con Navbar + Footer
│   │   ├── page.tsx                 → Homepage
│   │   ├── venta/                   → Catálogo venta /venta
│   │   ├── arriendo/                → Catálogo arriendo /arriendo
│   │   ├── propiedades/             → Catálogo + detalle /propiedades/[slug]
│   │   ├── blog/                    → Blog listing + post + por ciudad
│   │   ├── contacto/                → /contacto
│   │   ├── nosotros/                → /nosotros
│   │   ├── [ciudad]/                → /[ciudad] (página de ciudad dinámica)
│   │   ├── barrio/[slug]/           → /barrio/[slug]
│   │   ├── tag/[slug]/              → /tag/[slug]
│   │   ├── inmobiliaria-en-*/       → City landings estáticas
│   │   ├── vender-casa-en-*/        → Sell landings estáticas
│   │   ├── terminos/                → /terminos
│   │   └── privacidad/              → /privacidad
│   ├── admin/                       ← Panel de administración (protegido)
│   ├── api/                         ← API routes (OG images, sitemaps, webhooks)
│   ├── layout.tsx                   ← Root layout
│   ├── globals.css                  ← Tailwind v4 theme + custom utilities
│   └── sitemap.ts                   ← Sitemap dinámico
├── components/
│   ├── design-system/               ← 9 componentes de UI reutilizables
│   │   ├── NavbarV3.tsx
│   │   ├── FooterV3.tsx
│   │   ├── HomeHeroV3.tsx
│   │   ├── SearchBarV3.tsx
│   │   ├── PropertyCardV3.tsx
│   │   ├── CatalogHeader.tsx
│   │   ├── SortingControls.tsx
│   │   ├── Pagination.tsx
│   │   └── PropertyCardV2.tsx (legacy)
│   ├── PropertyGallery.tsx
│   ├── BlogCard.tsx
│   ├── ExploreAlso.tsx
│   ├── ListingConversionBanner.tsx
│   ├── WhatsAppFloatingButton.tsx
│   ├── MobileStickyCTA.tsx
│   ├── RetentionModal.tsx
│   ├── RecentlyViewed.tsx
│   └── tracking/                    ← Meta Pixel tracking
├── lib/
│   ├── supabase/                    ← Clientes y queries de Supabase
│   │   ├── client.ts
│   │   ├── properties.ts
│   │   └── posts.ts
│   └── seo/                         ← Generadores SEO
│       ├── generatePropertySEO.ts
│       ├── generateListingSEO.ts
│       └── generateListingFAQ.ts
├── public/
│   ├── robots.txt
│   ├── humans.txt
│   ├── og-default.jpg
│   └── logo.png
└── postcss.config.mjs
```

---

## Rutas y URL Structure

### Rutas estáticas (16)

| Ruta | Descripción |
|---|---|
| `/` | Homepage |
| `/venta` | Catálogo de propiedades en venta |
| `/arriendo` | Catálogo de propiedades en arriendo |
| `/propiedades` | Catálogo completo |
| `/contacto` | Página de contacto |
| `/nosotros` | Quiénes somos |
| `/blog` | Blog listing |
| `/terminos` | Términos y condiciones |
| `/privacidad` | Política de privacidad |
| `/inmobiliaria-en-cucuta` | Landing Inmobiliaria en Cúcuta |
| `/inmobiliaria-en-los-patios` | Landing Inmobiliaria en Los Patios |
| `/inmobiliaria-en-villa-del-rosario` | Landing Inmobiliaria en Villa del Rosario |
| `/vender-casa-en-cucuta` | Landing Vender en Cúcuta |
| `/vender-casa-en-los-patios` | Landing Vender en Los Patios |
| `/vender-casa-en-villa-del-rosario` | Landing Vender en Villa del Rosario |

### Rutas dinámicas (8)

| Ruta | Parámetros | Descripción |
|---|---|---|
| `/propiedades/[slug]` | slug: string | Detalle de propiedad |
| `/[ciudad]` | ciudad: 'cucuta' \| 'los-patios' \| 'villa-del-rosario' | Página de ciudad |
| `/venta/[ciudad]` | ciudad | Propiedades en venta por ciudad |
| `/venta/[ciudad]/[tipo]` | ciudad, tipo: 'casa' \| 'apartamento' \| 'lote' \| ... | Filtro venta+ciudad+tipo |
| `/arriendo/[ciudad]` | ciudad | Propiedades en arriendo por ciudad |
| `/arriendo/[ciudad]/[tipo]` | ciudad, tipo | Filtro arriendo+ciudad+tipo |
| `/blog/[slug]` | slug: string | Post de blog |
| `/blog/ciudad/[ciudad]` | ciudad | Blog posts por ciudad |
| `/barrio/[slug]` | slug: string | Página de barrio |
| `/tag/[slug]` | slug: string | Página de etiqueta |

---

## Layout y Navegación

### Jerarquía Visual
- **Root Layout** (`app/layout.tsx`): HTML base, fuentes, metadata global, JSON-LD global (Organization + RealEstateAgent), Meta Pixel
- **Public Layout** (`app/(public)/layout.tsx`): NavbarV3 + FooterV3 + WhatsAppFloatingButton
- **Admin Layout** (`app/admin/layout.tsx`): Layout separado para el panel admin

### Navegación Principal
1. **Venta** → `/venta`
2. **Arriendo** → `/arriendo`
3. **Blog** → `/blog`
4. **Vender** → subpáginas por ciudad
5. **Contacto** → `/contacto`

### Tipos de Inmueble (9)
Casa, Apartamento, Lote, Finca, Local, Oficina, Bodega, Casa Campestre, Apartaestudio

### Ciudades (3)
Cúcuta, Los Patios, Villa del Rosario

---

## SEO

### Títulos
- Template global: `%s | Inmobiliaria Tucasa Los Patios`
- Cada página tiene title + H1 optimizados con keywords geográficas y de servicio
- Los titles de propiedades siguen el patrón: `{tipo} en {operación} en {barrio}, {ciudad} | Inmobiliaria Tucasa Los Patios`

### Meta Tags
- `robots: index, follow` (global)
- `max-image-preview: large` en páginas de propiedades
- Open Graph tags en todas las páginas
- Twitter Cards `summary_large_image`

### Structured Data (JSON-LD)
- Organization + RealEstateAgent (global en root layout)
- WebPage + RealEstateListing + Offer + BreadcrumbList (propiedades)
- FAQPage (páginas de listado)

### Sitemaps
- `/sitemap.xml` — Dinámico, incluye rutas estáticas + propiedades + blog + barrios + ciudades + tipos
- `/image-sitemap` — XML namespace para imágenes de propiedades (Cloudinary)

### OG Images
- Default: `/og-default.jpg` (1200x630)
- Propiedades: Generadas dinámicamente en edge runtime con foto + precio + ubicación + logo

---

## Base de Datos (Supabase)

### Tablas principales
- **properties**: id, slug, tipo, operacion, precio, area, habitaciones, banos, barrio, ciudad, imagen_principal, galeria, etiquetas, status, created_at, updated_at
- **posts**: id, slug, title, content, excerpt, image, author, ciudad, published, created_at
- **leads**: id, nombre, email, telefono, mensaje, propiedad_id, created_at

### Funciones principales
- `getPropertiesByOperacion(operacion, habitaciones?, orden?, page?)`
- `getPropertyBySlug(slug)`
- `getTrendingProperties(limit, days)`
- `getPropertiesByBarrio(barrio)`
- `getSimilarProperties(propertyId, limit)`

---

## Despliegue

El proyecto está desplegado en **Vercel** con las siguientes variables de entorno requeridas:

| Variable | Descripción |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (para server-side) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloud name de Cloudinary |
| `NEXT_PUBLIC_SITE_URL` | `https://tucasalospatios.com` |
| `NEXT_PUBLIC_META_PIXEL_ID` | ID de Meta Pixel (Facebook Ads) |

### Comandos

```bash
npm run dev     # Desarrollo en localhost:3000
npm run build   # Build de producción
npm start       # Producción local
```

---

## Diseño Visual

Ver `DESIGN.md` en este mismo directorio para el sistema de diseño completo: colores, tipografía, espaciado, componentes, motion, voz de marca y anti-patrones.

---

## SEO Metadata

Para referencia de títulos y H1 actuales de cada página, consultar el archivo `DESIGN.md` sección 8 (Brand) y los source files en `app/(public)/` de cada página.
