# AGENTS.md

## Proyecto

Plataforma inmobiliaria premium para Norte de Santander desarrollada con Next.js 16, React 19, Supabase y Tailwind CSS 4.

Sitio:
https://tucasalospatios.com

---

# Objetivo principal

Mejorar continuamente:

- SEO técnico
- Conversión inmobiliaria
- Performance móvil
- UX/UI premium
- Core Web Vitals
- Retención de usuarios
- Escalabilidad del código

---

# Prioridades del agente

Prioridad máxima:

1. Responsive móvil
2. Performance
3. SEO técnico
4. UX inmobiliaria
5. Conversión de leads

---

# Reglas obligatorias

## Diseño

- Mantener estilo moderno y premium
- Evitar diseños saturados
- Mantener consistencia visual
- Mantener tipografía Poppins
- Priorizar legibilidad

## Desarrollo

- Nunca romper responsive
- Nunca duplicar componentes innecesariamente
- Reutilizar design-system siempre que sea posible
- Mantener compatibilidad App Router
- Evitar código legacy innecesario

## Performance

- Priorizar lazy loading
- Optimizar imágenes
- Minimizar CLS
- Evitar renders innecesarios
- Priorizar mobile-first

## SEO

- Mantener estructura H1-H6 correcta
- Validar metadata
- Validar JSON-LD
- Optimizar interlinking
- Mantener URLs limpias

---

# Arquitectura importante

## Componentes reutilizables

Usar preferiblemente:

- NavbarV3
- FooterV3
- PropertyCardV3
- SearchBarV3

Evitar usar PropertyCardV2 salvo compatibilidad legacy.

---

# Sistema visual

Consultar:
DESIGN.md

---

# Stack

- Next.js 16
- React 19
- Tailwind CSS 4
- Supabase
- Cloudinary
- TypeScript

---

# Comportamiento esperado

Antes de modificar código:

1. Explicar problema encontrado
2. Explicar solución propuesta
3. Indicar archivos afectados
4. Evaluar impacto responsive
5. Evaluar impacto SEO

---

# Áreas críticas

## SEO crítico

- app/sitemap.ts
- lib/seo/
- metadata dinámicos
- JSON-LD

## UX crítica

- HomeHeroV3
- SearchBarV3
- PropertyGallery
- MobileStickyCTA

## Conversión

- WhatsAppFloatingButton
- ListingConversionBanner
- RetentionModal

---

# Estrategia UX

El sitio debe sentirse:

- rápido
- premium
- moderno
- limpio
- confiable
- inmobiliario profesional

---

# Anti-patrones

Nunca:

- usar sliders pesados innecesarios
- usar imágenes sin optimización
- romper mobile-first
- introducir animaciones excesivas
- crear componentes duplicados
- empeorar Core Web Vitals

---

# Modo de trabajo

Cuando sea posible:

1. Analizar
2. Proponer
3. Explicar
4. Implementar
5. Validar