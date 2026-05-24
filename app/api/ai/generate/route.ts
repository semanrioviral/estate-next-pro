import { NextRequest, NextResponse } from "next/server";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
const OPENAI_BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const MODEL = process.env.AI_MODEL || "gpt-4o-mini";

const SYSTEM_PROMPT = `Eres un agente inmobiliario experto en Colombia (Norte de Santander: Cúcuta, Los Patios, Villa del Rosario).
Analiza la información de la propiedad y genera un JSON con TODOS los campos.

REGLAS IMPORTANTES:
- SIEMPRE responde en español colombiano profesional
- Sé preciso con los datos numéricos
- Si un dato NO está en el texto, usa null (NO inventes)
- Precio en números enteros, sin comas ni puntos ni símbolos
- Slug: solo minúsculas, sin acentos, guiones en vez de espacios
- La descripción debe ser atractiva, profesional, estilo editorial inmobiliario
- Meta título: máximo 60 caracteres, incluye keywords de ubicación
- Meta descripción: máximo 160 caracteres, persuasiva

FORMATO JSON EXACTO QUE DEBES DEVOLVER:
{
  "titulo": "Título atractivo con keywords (max 70 chars)",
  "tipo": "casa|apartamento|lote|comercial|proyecto|local|oficina|bodega|finca",
  "operacion": "venta|arriendo",
  "precio": 280000000,
  "moneda": "COP",
  "negociable": true,
  "ciudad": "Cúcuta|Los Patios|Villa del Rosario",
  "barrio": "Nombre del barrio",
  "direccion": "Dirección si existe o null",
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
  "descripcion_corta": "Resumen 140-160 caracteres para cards y SEO",
  "descripcion": "Descripción editorial completa, 2-3 párrafos, profesional y atractiva",
  "servicios": ["Piscina", "Gimnasio", "Seguridad 24h"],
  "etiquetas": ["Entrega Inmediata", "Estreno"],
  "financiamiento": "Info de financiamiento o null",
  "codigo_postal": "Código postal o null",
  "meta_titulo": "Título SEO 50-60 caracteres",
  "meta_descripcion": "Descripción SEO 150-160 caracteres",
  "slug": "url-amigable-sin-acentos",
  "canonical": "https://tucasalospatios.com/propiedades/slug"
}

DEVUELVE SOLO EL JSON, sin explicaciones ni markdown.`;

export async function POST(req: NextRequest) {
    try {
        const { text, imageUrls } = await req.json();

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
                "Authorization": `Bearer ${OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: userMessage },
                ],
                temperature: 0.3,
                max_tokens: 2000,
                response_format: { type: "json_object" },
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
