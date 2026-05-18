---
description: Auditoría avanzada de performance y Core Web Vitals
agent: build
---

# Objetivo

Analizar y optimizar el rendimiento general del proyecto inmobiliario.

Debes priorizar:

- Core Web Vitals
- velocidad móvil
- rendimiento Next.js
- experiencia mobile-first
- estabilidad visual
- optimización SEO técnica

---

# Analizar

## Core Web Vitals

Revisar:

- LCP
- CLS
- INP
- FCP
- TTFB

Detectar:
- elementos lentos
- render blocking
- problemas visuales
- cargas pesadas

---

## Rendering

Analizar:

- SSR innecesario
- force-dynamic
- ISR
- generateStaticParams
- hydration innecesaria
- client components excesivos

Priorizar:
- cache
- static rendering
- rendimiento SEO

---

## Imágenes

Revisar:

- Cloudinary
- tamaños
- formatos
- lazy loading
- imágenes above-the-fold
- preload innecesario

Detectar:
- imágenes pesadas
- imágenes duplicadas
- CLS por imágenes

---

## JavaScript

Analizar:

- bundles grandes
- imports innecesarios
- librerías pesadas
- client-side rendering excesivo
- componentes client innecesarios

---

## Sliders y UI dinámica

Revisar:

- Embla Carousel
- PropertyGallery
- HomeHeroV3
- animaciones
- modals

Detectar:
- re-renders innecesarios
- jank visual
- CLS
- consumo excesivo

---

## CSS y Tailwind

Analizar:

- globals.css
- clases redundantes
- CSS innecesario
- utilities repetidas

---

## Mobile Performance

Priorizar:

- dispositivos lentos
- conexiones móviles
- estabilidad visual
- interacción rápida

---

## Infraestructura

Revisar:

- Vercel
- caching
- headers
- compresión
- next.config.ts

---

# MCPs recomendados

Cuando sea posible usar:

- PageSpeed MCP
- Puppeteer MCP

---

# Entrega esperada

Debes entregar:

1. Problemas encontrados
2. Impacto performance
3. Core Web Vital afectado
4. Archivos afectados
5. Solución recomendada
6. Impacto esperado

---

# Reglas importantes

- Nunca empeorar SEO
- Nunca romper responsive
- Mantener diseño premium
- Priorizar mobile-first
- Evitar optimizaciones peligrosas