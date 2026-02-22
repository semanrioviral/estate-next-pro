interface ListingSEOParams {
  operacion: string;
  ciudad?: string;
  tipo?: string;
  barrio?: string;
  totalCount?: number;
}

function toTitleCase(value: string): string {
  return value
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function pluralizeTipo(tipo: string): string {
  const cleanTipo = tipo.trim().toLowerCase();
  if (cleanTipo.endsWith("s")) return toTitleCase(cleanTipo);
  return toTitleCase(`${cleanTipo}s`);
}

export function generateListingSEO(params: ListingSEOParams) {
  const operacion = (params.operacion || "venta").toLowerCase();
  const ciudad = params.ciudad?.trim();
  const tipo = params.tipo?.trim();
  const barrio = params.barrio?.trim();
  const totalCount = params.totalCount ?? 0;

  let titleH2 = "";

  if (ciudad && tipo) {
    titleH2 = `${pluralizeTipo(tipo)} en ${operacion} en ${toTitleCase(ciudad)}`;
  } else if (ciudad) {
    titleH2 = `Propiedades en ${operacion} en ${toTitleCase(ciudad)}`;
  } else {
    titleH2 = `Propiedades en ${operacion} en Norte de Santander`;
  }

  const locationText = ciudad ? toTitleCase(ciudad) : "Norte de Santander";
  const zoneContext = barrio
    ? `en el sector de ${toTitleCase(barrio)}`
    : ciudad
      ? `en ${toTitleCase(ciudad)}`
      : "en diferentes zonas del departamento";

  const paragraphs: string[] = [];

  paragraphs.push(
    ciudad
      ? `${tipo ? `Las ${pluralizeTipo(tipo).toLowerCase()} en ${operacion} ${zoneContext}` : `Nuestra inmobiliaria en ${toTitleCase(ciudad)} presenta propiedades en ${operacion} ${zoneContext}`}, con enfoque en ubicación, precio y potencial de valorización urbana, considerando la dinámica del mercado en la zona.`
      : `Este catálogo de finca raíz en Norte de Santander reúne alternativas para quienes buscan comprar con criterio, comparando ubicaciones, comportamiento del sector inmobiliario y proyección de crecimiento.`
  );

  paragraphs.push(
    `Si estás evaluando una inversión en bienes raíces en ${locationText}, aquí encuentras propiedades con información clara para tomar decisiones más seguras, desde inmuebles familiares hasta opciones con perfil de renta y entorno residencial consolidado.`
  );

  if (totalCount > 0) {
    paragraphs.push(
      `Actualmente contamos con ${totalCount} propiedades disponibles para ${operacion}${ciudad ? ` en ${toTitleCase(ciudad)}` : " en Norte de Santander"}, con alternativas para distintos presupuestos y necesidades de vivienda o inversión.`
    );
  }

  return {
    titleH2,
    paragraphs,
  };
}
