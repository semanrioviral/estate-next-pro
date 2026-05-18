Resultado CLS post-deploy
Página	Antes	Después	Status
/propiedades	0.145 ❌	0.002 ✅	98.6% reducción
/venta	0.118 ❌	0.001 ✅	99.2% reducción
Ambos catálogos pasaron de "Needs Improvement" (<0.25 pero >0.1) a "Good" (<0.1) en Core Web Vitals. Performance Score en /propiedades subió de 86 → 96.
El fix de 1 línea en CatalogHeader.tsx:77 (h-16 → h-[336px] md:h-16) eliminó el CLS del catálogo sin afectar SEO, responsive ni diseño.