interface GenerateListingFAQParams {
  operacion: string;
  ciudad?: string;
  tipo?: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

function toTitleCase(value: string): string {
  return value
    .split("-")
    .join(" ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function normalizeTipo(tipo?: string) {
  if (!tipo) return "propiedad";
  return tipo.toLowerCase().trim();
}

export function generateListingFAQ({ operacion, ciudad, tipo }: GenerateListingFAQParams) {
  const operacionLabel = (operacion || "venta").toLowerCase();
  const cityLabel = ciudad ? toTitleCase(ciudad) : "Norte de Santander";
  const tipoLabel = normalizeTipo(tipo);
  const tipoConArticulo = tipo ? `una ${tipoLabel}` : "una propiedad";
  const tipoPlural = tipo
    ? (tipoLabel.endsWith("s") ? tipoLabel : `${tipoLabel}s`)
    : "propiedades";

  const faqItems: FAQItem[] = [
    {
      question: `¿Cuánto cuesta ${tipoConArticulo} en ${operacionLabel} en ${cityLabel}?`,
      answer: `El valor depende de la zona, el metraje, el estado del inmueble y la demanda actual. En nuestro catálogo puedes comparar ${tipoPlural} por precio y características para identificar oportunidades acordes a tu presupuesto.`
    },
    {
      question: `¿Es buena inversión comprar ${tipo ? tipoLabel : "propiedad"} en ${cityLabel}?`,
      answer: `Sí, cuando la compra se alinea con tu objetivo de vivienda o renta. Revisar ubicación, conectividad, servicios cercanos y comportamiento de precios ayuda a tomar una decisión más segura y con mejor proyección.`
    },
    {
      question: `¿Qué zonas de ${cityLabel} tienen mayor valorización?`,
      answer: `Las zonas con mejor dinámica urbana, desarrollo de infraestructura y oferta de servicios suelen mostrar mayor potencial de valorización. Nuestro equipo te orienta para identificar sectores con demanda sostenida y buena liquidez.`
    }
  ];

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.tucasalospatios.com";
  const absoluteUrl = `${siteUrl}/venta${ciudad ? `/${ciudad}` : ""}${tipo ? `/${tipo}` : ""}#faq`;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "FAQPage",
        "@id": absoluteUrl,
        "mainEntity": faqItems.map((item) => ({
          "@type": "Question",
          "name": item.question,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": item.answer
          }
        }))
      }
    ]
  };

  return {
    faqItems,
    faqJsonLd
  };
}
