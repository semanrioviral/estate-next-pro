import { NextRequest, NextResponse } from "next/server";

const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.deepseek.com/v1";
const MODEL = process.env.AI_MODEL || "deepseek-chat";

const SYSTEM_PROMPT = `Eres un AGENTE INMOBILIARIO PROFESIONAL y ESPECIALISTA EN SEO para el mercado de Norte de Santander, Colombia (Cúcuta, Los Patios, Villa del Rosario y alrededores).

Tu trabajo es analizar la información cruda de una propiedad y transformarla en contenido PREMIUM, persuasivo y optimizado para posicionar en Google.

⚠️ REGLAS DE ORO:
1. SIEMPRE responde en español colombiano profesional
2. NUNCA inventes datos que no estén en el texto
3. Si un dato no aparece, usa null
4. Precios en números enteros, sin símbolos ni comas
5. Slug: solo minúsculas, sin acentos, guiones en vez de espacios

🔍 ESTRATEGIA SEO (MUY IMPORTANTE):
- Incluye keywords de alta intención: "en venta", "en arriendo", la ciudad, el barrio, el tipo de inmueble
- El título debe contener: tipo + operación + característica destacada + ubicación (max 70 chars)
- La descripción corta debe ser un gancho persuasivo con la keyword principal al inicio (140-160 chars)
- La descripción larga debe incluir keywords naturalmente: ubicación, características, beneficios, llamado a la acción
- Meta título: fórmula ganadora = "[Tipo] en [Operación] en [Barrio], [Ciudad] — [Característica] | Tucasa Los Patios" (50-60 chars)
- Meta descripción: incluye precio, ubicación, características principales y CTA "Contáctanos" (150-160 chars)
- Slug: url limpia con keywords separadas por guiones
- Las etiquetas ayudan al SEO interno: incluye palabras clave relevantes

📝 CALIDAD EDITORIAL:
- Descripción larga: 3 párrafos. Párrafo 1: describe el inmueble. Párrafo 2: habla del sector/ubicación. Párrafo 3: beneficios y llamado a la acción.
- Tono: profesional, entusiasta, confiable. NO uses frases genéricas como "no dejes pasar esta oportunidad".
- Destaca lo que hace ÚNICA a la propiedad.
- Usa palabras que conecten emocionalmente: "exclusivo", "confortable", "amplio", "luminoso", "moderno".

FORMATO JSON EXACTO:
{
  "titulo": "Título SEO (max 70 chars). Ej: Apartamento en Venta en Caobos, Cúcuta — 120m² con Piscina y Vista Panorámica",
  "tipo": "casa|apartamento|lote|comercial|proyecto|local|oficina|bodega|finca",
  "operacion": "venta|arriendo",
  "precio": 280000000,
  "moneda": "COP",
  "negociable": true,
  "ciudad": "Cúcuta|Los Patios|Villa del Rosario",
  "barrio": "Nombre del barrio",
  "direccion": "Dirección exacta si aparece o null",
  "habitaciones": 3,
  "banos": 2,
  "parqueaderos": 1,
  "area_m2": 120,
  "medidas_lote": "Ej: 8x15m o null",
  "estrato": 4,
  "antiguedad": "Nuevo|Usado|En construcción|null",
  "anio_construccion": 2023,
  "canon_administracion": 380000,
  "tipo_uso": "Residencial|Comercial|Mixto|Industrial",
  "descripcion_corta": "Resumen persuasivo 140-160 caracteres. Debe incluir tipo, ubicación, precio y característica principal",
  "descripcion": "3 párrafos: 1) El inmueble 2) La ubicación 3) Beneficios y CTA. Usa formato profesional con saltos de línea.",
  "servicios": ["Piscina", "Gimnasio", "Seguridad 24h"],
  "etiquetas": ["Entrega Inmediata", "Estreno", "Vista Panorámica"],
  "financiamiento": "Info de financiamiento o null",
  "codigo_postal": "Código postal o null",
  "meta_titulo": "50-60 caracteres. Fórmula: Tipo en Operación en Barrio, Ciudad — Característica | Tucasa Los Patios",
  "meta_descripcion": "150-160 caracteres persuasivos con precio, ubicación, características y CTA",
  "slug": "url-amigable-solo-minusculas-y-guiones",
  "canonical": "https://tucasalospatios.com/propiedades/[slug]"
}

DEVUELVE SOLO EL JSON, sin explicaciones, sin markdown, sin texto adicional.`;

export async function POST(req: NextRequest) {
    try {
        const { text, imageUrls, apiKey } = await req.json();

        const effectiveKey = apiKey || process.env.OPENAI_API_KEY;
        if (!effectiveKey) {
            return NextResponse.json({ error: "API Key no configurada. Ingresa tu key en el campo 🔑." }, { status: 401 });
        }

        if (!text || text.trim().length < 10) {
            return NextResponse.json({ error: "Necesito al menos 10 caracteres de descripción." }, { status: 400 });
        }

        const userMessage = `Analiza esta información de propiedad y genera el JSON completo:

${text}

${imageUrls && imageUrls.length > 0 ? `IMÁGENES ADJUNTAS: ${imageUrls.length} fotos. La primera es la principal.` : ""}`;

        const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                    "Authorization": `Bearer ${effectiveKey}`,
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: userMessage },
                ],
                temperature: 0.3,
                max_tokens: 2000,
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("[AI] API Error:", response.status, err.slice(0, 300));
            return NextResponse.json({ error: `Error de IA: ${response.status}` }, { status: 500 });
        }

        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;

        if (!content) {
            return NextResponse.json({ error: "La IA no devolvió contenido." }, { status: 500 });
        }

        // Parse JSON from response (handle possible markdown wrapping)
        let parsed;
        try {
            parsed = JSON.parse(content);
        } catch {
            // Try extracting JSON from markdown code block
            const match = content.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (match) {
                parsed = JSON.parse(match[1].trim());
            } else {
                return NextResponse.json({ error: "La IA devolvió un formato inválido.", raw: content.slice(0, 500) }, { status: 500 });
            }
        }

        // Normalize field names (Spanish -> English for our DB)
        const property = {
            titulo: parsed.titulo || "",
            tipo: parsed.tipo || "casa",
            operacion: parsed.operacion || "venta",
            precio: Number(parsed.precio) || 0,
            moneda: parsed.moneda || "COP",
            negociable: parsed.negociable ?? false,
            ciudad: parsed.ciudad || "",
            barrio: parsed.barrio || "",
            direccion: parsed.direccion || "",
            habitaciones: Number(parsed.habitaciones) || 0,
            baños: Number(parsed.banos || parsed.baños) || 0,
            parqueaderos: Number(parsed.parqueaderos) || 0,
            area_m2: Number(parsed.area_m2) || 0,
            medidas_lote: parsed.medidas_lote || null,
            estrato: Number(parsed.estrato) || null,
            antigüedad: parsed.antiguedad || null,
            año_construccion: Number(parsed.anio_construccion || parsed.año_construccion) || null,
            canon_administracion: Number(parsed.canon_administracion) || null,
            tipo_uso: parsed.tipo_uso || "Residencial",
            descripcion_corta: parsed.descripcion_corta || "",
            descripcion: parsed.descripcion || "",
            servicios: Array.isArray(parsed.servicios) ? parsed.servicios : [],
            etiquetas: Array.isArray(parsed.etiquetas) ? parsed.etiquetas : [],
            financiamiento: parsed.financiamiento || null,
            codigo_postal: parsed.codigo_postal || null,
            meta_titulo: parsed.meta_titulo || parsed.titulo || "",
            meta_descripcion: parsed.meta_descripcion || parsed.descripcion_corta || "",
            slug: parsed.slug || "",
            canonical: parsed.canonical || null,
            // Passthrough raw for debugging
            _ia_raw: process.env.NODE_ENV === "development" ? parsed : undefined,
        };

        return NextResponse.json({ success: true, property });
    } catch (err: any) {
        console.error("[AI] Exception:", err.message);
        return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
    }
}
