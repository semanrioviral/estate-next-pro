# Tucasa LP — Design System

> **Project:** Inmobiliaria Tucasa Los Patios — Plataforma de propiedades en venta y arriendo en Norte de Santander, Colombia.
> **Sitio:** https://tucasalospatios.com
> **Stack:** Next.js 16 + React 19 + Tailwind CSS v4 + TypeScript 5
> **Fuente principal:** Outfit (Google Fonts)

---

## 1. Color

### Brand Palette (Corporate Red)

| Token | Hex | Uso |
|---|---|---|
| `--color-brand` / `--color-brand-600` | `#e7000b` | Acciones primarias, H1, enlaces, badges, hover states |
| `--color-brand-700` | `#c10007` | Hover de botones primarios |
| `--color-brand-800` | `#9f0712` | Active/pressed states |
| `--color-whatsapp` | `#25D366` | Botón flotante de WhatsApp y CTAs relacionados |

### Neutral Palette

| Token | Hex | Uso |
|---|---|---|
| `--color-text-primary` | `#0f172a` (Slate 900) | Titulares, cuerpo principal |
| `--color-text-secondary` | `#334155` (Slate 700) | Texto secundario, descripciones |
| `--color-text-muted` | `#64748b` (Slate 500) | Metadatos, fechas, breadcrumbs |
| `--color-bg-main` | `#ffffff` | Fondo principal |
| `--color-bg-alt` | `#f8fafc` (Slate 50) | Fondos alternos, secciones destacadas |
| `--color-border-clean` | `#e2e8f0` (Slate 200) | Bordes, separadores, inputs |

### Principios de color
- Sin modo oscuro. La interfaz siempre es light mode.
- Alto contraste: texto primario `#0f172a` sobre fondo blanco pasa WCAG AA.
- El rojo corporativo se usa con moderación: solo en elementos de alta jerarquía (H1, CTAs principales, badges).
- Sombras ultra sutiles (`box-shadow: 0 1px 2px rgba(0,0,0,0.05)`) — no se usan sombras pesadas.

---

## 2. Typography

### Font Stack

| Rol | Fuente | Fallback |
|---|---|---|
| Sans-serif (principal) | **Outfit** (400, 500, 600, 700) | `ui-sans-serif, system-ui` |
| Mono | Geist Mono | `ui-monospace, SFMono-Regular` |

### Type Scale

| Token | Tamaño | Uso típico |
|---|---|---|
| `--text-xs` | 0.75rem (12px) | Mínimo, etiquetas pequeñas |
| `--text-sm` | 0.8125rem (13px) | Metadatos, badges |
| `--text-base` | 1rem (16px) | Cuerpo de texto |
| `--text-lg` | 1.125rem (18px) | Texto destacado |
| `--text-xl` | 1.25rem (20px) | Subtítulos, navegación |
| `--text-2xl` | 1.5rem (24px) | H3 |
| `--text-3xl` | 1.875rem (30px) | H3 grandes |
| `--text-4xl` | 2.25rem (36px) | H2 |
| `--text-5xl` | 3rem (48px) | H1 (tablet/desktop) |
| `--text-6xl` | 3.75rem (60px) | H1 (desktop large) |

### Heading Styles

| Element | Font | Weight | Tracking | Leading | Color |
|---|---|---|---|---|---|
| H1 | Outfit | Extrabold (700) | `tracking-tight` | `leading-[1.15]` | `--color-brand` (#e7000b) |
| H2 | Outfit | Bold (700) | `tracking-tight` | `leading-snug` | `text-slate-900` |
| H3 | Outfit | Bold (700) | `tracking-tight` | `normal` | `text-slate-800` |

### Body Text
- Font size: 16px
- Line height: 1.6
- Font smoothing: `antialiased`
- Color: `#222222` (foreground)

---

## 3. Spacing

### Layout Containers

| Utility | Max-width | Padding horizontal |
|---|---|---|
| `container-wide` | 1280px (max-w-7xl) | `px-4 sm:px-6 lg:px-8` (16px → 24px → 32px) |

### Vertical Rhythm
- Secciones principales: `py-24` (96px padding vertical)
- Secciones secundarias: `py-16` o `py-20`
- Espaciado entre cards: `gap-6` (24px) o `gap-8` (32px)
- Espaciado interno de cards: `p-4` o `p-6`

### Border Radius

| Token | Value | Uso |
|---|---|---|
| `--radius-sm` | 6px | Botones, inputs |
| `--radius-md` | 10px | Cards |
| `--radius-lg` | 14px | Modales |
| `--radius-xl` | 18px | Contenedores destacados |
| `--radius-2xl` | 22px | Hero sections |
| `--radius-3xl` | 28px | Elementos decorativos |
| `--radius-full` | 9999px | Badges, avatares |

---

## 4. Layout

### Page Structure
```
Root Layout (app/layout.tsx)
  ├── Head: preconnect Cloudinary, preload hero image, JSON-LD global
  └── Body
       └── Public Layout (app/(public)/layout.tsx) [client component]
            ├── NavbarV3 (fixed top, transparent on home)
            ├── <main> (pt-0 home | pt-20 md:pt-24 others)
            │    └── {children} (page content)
            ├── FooterV3
            └── WhatsAppFloatingButton
```

### Navbar
- Fixed position, `z-50`
- Homepage: transparent background con texto blanco; al scrollear se vuelve sólido (blanco)
- Otras páginas: fondo blanco sólido siempre
- Logo vía Cloudinary (formato f_auto q_auto)
- 5 enlaces: Venta, Arriendo, Blog, Vender, Contacto
- Menú hamburguesa en mobile con CTA de WhatsApp

### Footer
- Fondo oscuro (`bg-slate-900` o similar)
- Logo + misión + redes sociales (Instagram, Facebook)
- 3 columnas: Empresa, Vínculos útiles, Contacto
- Barra inferior con enlaces legales (Términos, Privacidad)

### Grid System
- Catalog pages: `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6`
- Property detail: `flex flex-col lg:flex-row` (galería + info side by side en desktop)
- Hero: `flex flex-col items-center justify-center` centrado

---

## 5. Components

### NavbarV3
- **Props:** ninguna (lee `pathname` internamente)
- **Estados:** transparente (home) / sólido (otras páginas) / mobile hamburguesa
- **Contenido:** logo, 5 links de navegación, CTA WhatsApp
- **Comportamiento:** fixed top, background transition on scroll

### FooterV3
- **Props:** ninguna
- **Contenido:** branding, misión, redes, 3 columnas nav, WhatsApp, legal

### HomeHeroV3
- **Props:** ninguna
- **Contenido:** imagen de fondo full-bleed con overlay oscuro, badge "Líder en Finca Raíz", H1, 2 CTAs
- **CTAs:** "Ver Propiedades" (btn-primary) + "Consignar Inmueble" (btn-secondary)

### PropertyCardV3
- **Props:** `property: Property`
- **Dimensiones:** altura fija `h-[480px] md:h-[490px]`
- **Contenido:** imagen 16:9, precio COP, tipo + operación, badges, habitaciones/baños/área, ubicación, CTA WhatsApp
- **Estados:** normal, hover (escala sutil `active:scale-[0.98]`)

### SearchBarV3
- **Props:** `variant: 'hero' | 'compact'`, `onSearch?: () => void`
- **Campos:** operación (venta/arriendo toggle), ciudad (dropdown), barrio (dropdown dinámico), tipo (dropdown con 9 opciones), habitaciones (selector)
- **Comportamiento:** se prellena desde parámetros URL, barrio se actualiza según ciudad

### CatalogHeader
- **Props:** breadcrumbs, title (ReactNode), description, total count, SortingControls, SearchBarV3
- **Uso:** todas las páginas de catálogo (venta, arriendo, ciudad, tipo)

### Pagination
- **Props:** `currentPage, totalPages, baseUrl, searchParams`
- **Comportamiento:** previous/next, números de página responsivos

### WhatsAppFloatingButton
- **Props:** ninguna
- **Comportamiento:** fixed bottom-right, enlace directo a WhatsApp (+57 322 304 7435)
- **Tracking:** integrado con Meta Pixel vía TrackedWhatsappButton

### Formularios (Catalog, Blog, Static)
- Inputs standard: `h-11 px-4 bg-white border border-slate-200 rounded-md text-sm focus:ring-1 focus:ring-brand focus:border-brand`
- Botón primario: `h-11/12 px-6 bg-brand text-white rounded-md font-semibold shadow-sm hover:bg-brand-700`
- Botón secundario: `h-11/12 px-6 bg-white border border-slate-200 text-slate-700 rounded-md font-semibold hover:bg-slate-50`

---

## 6. Motion

### Transiciones
- Hover en botones: `transition-all hover:bg-brand-700 active:scale-[0.98]` (200ms)
- Hover en cards: `transition-all hover:shadow-md`
- Navbar background: `transition-colors duration-300`
- Enlaces en texto: `transition-colors`

### Animation Flags
- Sin animaciones decorativas ni parallax.
- Sin scroll-triggered animations.
- Sin cargas progresivas (skeleton screens).
- Las transiciones son funcionales, no decorativas.

---

## 7. Voice & Tone

### Principios
- **Profesional pero cercano:** lenguaje formal sin ser frío, cercano sin ser informal.
- **Regional:** enfoque en Norte de Santander, menciones específicas de barrios y ciudades.
- **Confiable:** tono de autoridad en el mercado inmobiliario local.
- **Claro:** descripciones directas, sin jargon innecesario.

### Ejemplos de voz
- "Tu hogar ideal está aquí"
- "Líder en Finca Raíz Norte de Santander"
- "Casas y apartamentos en venta en Los Patios y Cúcuta"

### Público
- Compradores de vivienda (jóvenes, familias)
- Vendedores de propiedades
- Inversionistas locales
- Todos los textos están en español colombiano.

---

## 8. Brand

### Identidad
- **Nombre:** Inmobiliaria Tucasa Los Patios
- **Eslogan:** "Líder en Finca Raíz Norte de Santander"
- **URL:** https://tucasalospatios.com
- **Teléfono:** +57 322 304 7435
- **Email:** gerencia@tucasalospatios.com
- **Ubicación:** Los Patios, Norte de Santander, Colombia
- **Redes:** Instagram (@tucasalospatios), Facebook (Tucasa Los Patios)

### Logo
- Archivo: `public/logo.png` (228x133, rectangular)
- Favicon: Generado dinámicamente vía `app/icon/route.tsx` usando `ImageResponse` de `next/og` — logo centrado en canvas 512x512 sobre fondo blanco
- En páginas: logo renderizado desde Cloudinary (`f_auto q_auto`)

### OG Image
- Default: `public/og-default.jpg` (1200x630)
- Propiedades: generada dinámicamente en `/api/og/propiedad/[slug]` vía `ImageResponse` (edge runtime) con foto, precio, ubicación, logo y badge de operación

### Schema.org / JSON-LD
- `Organization`: nombre, url, logo, teléfono, email, dirección
- `RealEstateAgent`: misma info + `areaServed` (Los Patios, Cúcuta, Villa del Rosario)
- `WebPage`: en cada página de propiedad
- `RealEstateListing`: en cada página de propiedad con `offer` (Precio, moneda, disponibilidad)
- `BreadcrumbList`: en catálogos y propiedades
- `FAQPage`: en páginas de listado

---

## 9. Anti-patterns

### Lo que NO se hace
1. **No modo oscuro** — La interfaz siempre es light mode. Forzado en CSS con `@media (prefers-color-scheme: dark)` override.
2. **No parallax ni scroll animations** — Sin animaciones decorativas, solo transiciones funcionales.
3. **No sombras pesadas** — `box-shadow` ultra sutiles (`0 1px 2px rgba(0,0,0,0.05)`).
4. **No imágenes sin Cloudinary** — Todas las imágenes de propiedades pasan por Cloudinary con `f_auto q_auto` para optimización.
5. **No títulos genéricos** — Cada página tiene title y H1 optimizados con keywords geográficas y de servicio.
6. **No textos sin peso semántico** — No usar `<p>` donde corresponde `<h2>` o `<h3>`.
7. **No formularios sin validación** — Todos los inputs tienen focus ring, placeholder y validación.
8. **No enlaces rotos** — Todas las URLs son relativas o absolutas con `https://tucasalospatios.com`.

---

## BEM / Naming

No se usa BEM. El proyecto utiliza Tailwind CSS v4 con utilidades atómicas. Los componentes son archivos `.tsx` con estilos directamente desde las clases de Tailwind. No existen archivos CSS modulares ni CSS-in-JS adicional.

---

## Component Tree

```
app/(public)/                              ← Client Component (Navbar, Footer)
├── page.tsx                               ← Homepage (Server Component)
│   ├── HomeHeroV3                         ← Hero full-viewport
│   ├── FeaturedPropertiesSection          ← Grid de propiedades destacadas
│   ├── CityShowcase                       ← Links por ciudad
│   └── ExploreAlso                        ← Navegación adicional
├── venta/page.tsx                         ← Catálogo de venta
├── arriendo/page.tsx                      ← Catálogo de arriendo
├── propiedades/page.tsx                   ← Catálogo completo
├── propiedades/[slug]/page.tsx            ← Detalle de propiedad
├── blog/page.tsx                          ← Blog listing
├── blog/[slug]/page.tsx                   ← Post individual
├── contacto/page.tsx                      ← Página de contacto
├── nosotros/page.tsx                      ← Quiénes somos
├── [ciudad]/page.tsx                      ← Página de ciudad
├── barrio/[slug]/page.tsx                 ← Página de barrio
├── tag/[slug]/page.tsx                    ← Página de etiqueta
├── inmobiliaria-en-*/page.tsx             ← Landings de ciudad
├── vender-casa-en-*/page.tsx              ← Landings de venta
├── venta/[ciudad]/page.tsx               ← Filtro venta+ciudad
├── venta/[ciudad]/[tipo]/page.tsx        ← Filtro venta+ciudad+tipo
├── arriendo/[ciudad]/page.tsx            ← Filtro arriendo+ciudad
├── arriendo/[ciudad]/[tipo]/page.tsx     ← Filtro arriendo+ciudad+tipo
├── blog/ciudad/[ciudad]/page.tsx         ← Blog por ciudad
├── terminos/page.tsx                      ← Términos legales
└── privacidad/page.tsx                    ← Privacidad
```

---

## Data Flow

```
Supabase ←→ Server Components (async) → Render TSX → Static/Dynamic HTML
                  ↕
           Cloudinary (imágenes)
                  ↕
      generateStaticParams (rutas dinámicas)
                  ↕
           generateMetadata (SEO dinámico)
```

- Propiedades: `lib/supabase/properties.ts`
- Blog: `lib/supabase/posts.ts`
- SEO: `lib/seo/generatePropertySEO.ts`, `lib/seo/generateListingSEO.ts`, `lib/seo/generateListingFAQ.ts`
- Sitemaps: `app/sitemap.ts` (dinámico), `app/image-sitemap/route.ts`
- OG Images: `app/api/og/propiedad/[slug]/route.tsx` (edge runtime)
