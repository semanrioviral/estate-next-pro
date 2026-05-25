import type { Property } from '../supabase/properties';
import { CIUDAD_MAP, SITE_URL, normalizeSiteUrl } from '../supabase/constants';

export interface SEOOutput {
  title: string;
  description: string;
  openGraph: {
    title: string;
    description: string;
    url: string;
    siteName: string;
    locale: string;
    images: Array<{
      url: string;
      width: number;
      height: number;
      alt: string;
    }>;
    type: string;
  };
  twitter: {
    card: string;
    title: string;
    description: string;
    images: string[];
  };
  jsonLd: Record<string, unknown>;
  alternates: {
    canonical: string;
  };
}

export interface PropertySEOContext {
  siteUrl: string;
  brand?: string;
}

const BRAND = 'Inmobiliaria Tucasa Los Patios';
const SITE_NAME = 'Inmobiliaria Tucasa Los Patios';
const LOCALE = 'es_CO';

function capitalize(text: string): string {
  if (!text) return '';
  return text
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

function capitalizeFirst(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

function formatPriceCOP(price: number): string {
  return price.toLocaleString('es-CO', { style: 'decimal', maximumFractionDigits: 0 });
}

function formatArea(area: number | undefined): string {
  if (!area) return '';
  return `${area} m²`;
}

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  const truncated = text.substring(0, maxLength);
  return truncated.substring(0, truncated.lastIndexOf(' ')) + '...';
}

function getOperacionText(operacion: 'venta' | 'arriendo'): string {
  return operacion === 'venta' ? 'Venta' : 'Arriendo';
}

function getTipoDisplay(tipo: string): string {
  const tipoMap: Record<string, string> = {
    'casa': 'Casa',
    'apartamento': 'Apartamento',
    'lote': 'Lote',
    'proyecto': 'Proyecto',
    'local': 'Local',
    'oficina': 'Oficina',
    'bodega': 'Bodega',
    'finca': 'Finca',
    'comercial': 'Inmueble comercial',
  };
  return tipoMap[tipo.toLowerCase()] || capitalizeFirst(tipo);
}

function getCiudadDisplay(ciudad: string): string {
  const normalized = ciudad.toLowerCase().trim();
  return CIUDAD_MAP[normalized] || capitalize(ciudad);
}

function getBarrioDisplay(barrio: string): string {
  return capitalize(barrio);
}

function buildPropertyURL(property: Property, siteUrl: string): string {
  return `${normalizeSiteUrl(siteUrl)}/propiedades/${property.slug}`;
}

function buildBarrioURL(barrioSlug: string, siteUrl: string): string {
  return `${normalizeSiteUrl(siteUrl)}/barrio/${barrioSlug}`;
}

function getAbsoluteImageUrl(imageUrl: string, siteUrl: string): string {
  if (imageUrl.startsWith('http')) return imageUrl;
  return `${normalizeSiteUrl(siteUrl)}${imageUrl}`;
}

export function generatePropertyTitle(property: Property): string {
  const tipo = getTipoDisplay(property.tipo);
  const operacion = getOperacionText(property.operacion);
  const barrio = getBarrioDisplay(property.barrio);
  const ciudad = getCiudadDisplay(property.ciudad);

  return `${tipo} en ${operacion} en ${barrio}, ${ciudad} | ${BRAND}`;
}

export function generatePropertyDescription(property: Property): string {
  const tipo = getTipoDisplay(property.tipo);
  const operacion = getOperacionText(property.operacion);
  const barrio = getBarrioDisplay(property.barrio);
  const ciudad = getCiudadDisplay(property.ciudad);

  const parts: string[] = [];

  parts.push(`${capitalizeFirst(tipo)} en ${operacion.toLowerCase()} ubicada en el sector de ${barrio}, ${ciudad}.`);

  const features: string[] = [];
  if (property.habitaciones) {
    features.push(`${property.habitaciones} habitaciones`);
  }
  if (property.baños) {
    features.push(`${property.baños} baños`);
  }
  if (property.area_m2) {
    features.push(`${formatArea(property.area_m2)}`);
  }

  if (features.length > 0) {
    parts.push(`${capitalizeFirst(features.join(', '))}.`);
  }

  parts.push(`Precio $${formatPriceCOP(property.precio)}${property.negociable ? ', precio negociable' : ''}.`);
  parts.push(`Consulta disponibilidad y agenda tu visita sin compromiso.`);

  const description = parts.join(' ');
  return truncate(description, 155);
}

export function generatePropertyOGDescription(property: Property): string {
  const tipo = getTipoDisplay(property.tipo);
  const barrio = getBarrioDisplay(property.barrio);
  const ciudad = getCiudadDisplay(property.ciudad);

  const features: string[] = [];
  if (property.habitaciones) features.push(`${property.habitaciones} hab`);
  if (property.baños) features.push(`${property.baños} baños`);
  if (property.area_m2) features.push(`${formatArea(property.area_m2)}`);

  const featureText = features.length > 0 ? ` | ${features.join(' · ')}` : '';
  const priceText = ` | $${formatPriceCOP(property.precio)}`;

  return `${capitalizeFirst(tipo)} en ${barrio}, ${ciudad}${featureText}${priceText}`;
}

export function generatePropertyJSONLD(property: Property, siteUrl: string): Record<string, unknown> {
  siteUrl = normalizeSiteUrl(siteUrl);
  const propertyUrl = buildPropertyURL(property, siteUrl);

  // Usar la imagen de Cloudinary directamente (misma estrategia que og:image)
  const rawImage = property.imagen_principal || '';
  const brandedOgImage = rawImage ? getCloudinaryOGImage(rawImage) : `${siteUrl}/api/og/propiedad/${property.slug}`;

  const propertyImages = Array.from(
    new Set([property.imagen_principal, ...(property.galeria || [])].filter(Boolean))
  );

  const tipo = getTipoDisplay(property.tipo);
  const operacion = getOperacionText(property.operacion);
  const barrio = getBarrioDisplay(property.barrio);
  const imageCaption = `${tipo} en ${operacion} en ${barrio} - $${formatPriceCOP(property.precio)}`;

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${propertyUrl}#webpage`,
        'url': propertyUrl,
        'primaryImageOfPage': {
          '@type': 'ImageObject',
          'url': brandedOgImage,
          'width': 1200,
          'height': 630,
          'caption': imageCaption
        }
      },
      {
        '@type': 'RealEstateListing',
        '@id': `${propertyUrl}#listing`,
        'name': `${getTipoDisplay(property.tipo)} en ${getOperacionText(property.operacion)} en ${getBarrioDisplay(property.barrio)}, ${getCiudadDisplay(property.ciudad)}`,
        'description': generatePropertyDescription(property),
        'url': propertyUrl,
        'image': propertyImages.map(img => getAbsoluteImageUrl(img, siteUrl)),
        'brand': {
          '@type': 'Organization',
          'name': BRAND
        },
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': getCiudadDisplay(property.ciudad),
          'addressRegion': 'Norte de Santander',
          'addressCountry': 'CO'
        },
        'geo': {
          '@type': 'GeoCoordinates',
          'addressLocality': getBarrioDisplay(property.barrio),
          'addressRegion': 'Norte de Santander'
        },
        'category': `${getTipoDisplay(property.tipo)} en ${getOperacionText(property.operacion)}`,
        ...(property.precio ? {
          'offers': {
            '@type': 'Offer',
            'price': property.precio,
            'priceCurrency': 'COP',
            'availability': 'https://schema.org/InStock',
            'url': propertyUrl,
            'seller': {
              '@type': 'RealEstateAgent',
              'name': BRAND
            }
          }
        } : {}),
        'additionalProperty': [
          ...(property.habitaciones ? [{
            '@type': 'PropertyValue',
            'name': 'Habitaciones',
            'value': property.habitaciones
          }] : []),
          ...(property.baños ? [{
            '@type': 'PropertyValue',
            'name': 'Baños',
            'value': property.baños
          }] : []),
          ...(property.area_m2 ? [{
            '@type': 'PropertyValue',
            'name': 'Área',
            'value': property.area_m2,
            'unitCode': 'MTK'
          }] : [])
        ]
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${propertyUrl}#breadcrumb`,
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Inicio', 'item': siteUrl },
          { '@type': 'ListItem', 'position': 2, 'name': 'Venta', 'item': `${siteUrl}/venta` },
          { '@type': 'ListItem', 'position': 3, 'name': getBarrioDisplay(property.barrio), 'item': buildBarrioURL(property.barrio_slug || '', siteUrl) },
          { '@type': 'ListItem', 'position': 4, 'name': property.titulo, 'item': propertyUrl }
        ]
      }
    ]
  };
}

/**
 * Convierte una URL de Cloudinary en una URL optimizada para Open Graph (1200×630).
 * Si la URL no es de Cloudinary, la devuelve tal cual.
 */
function getCloudinaryOGImage(imageUrl: string): string {
  if (imageUrl?.includes('/upload/')) {
    return imageUrl.replace('/upload/', '/upload/f_auto,q_auto,c_fill,w_1200,h_630,g_auto/');
  }
  return imageUrl;
}

export function generatePropertySEO(
  property: Property,
  context: PropertySEOContext = { siteUrl: SITE_URL }
): SEOOutput {
  const { siteUrl: rawSiteUrl } = context;
  const siteUrl = normalizeSiteUrl(rawSiteUrl);
  const propertyUrl = buildPropertyURL(property, siteUrl);

  // Usar la imagen de Cloudinary directamente en lugar del endpoint Satori
  // (Satori devuelve 0 bytes en el Edge runtime actual)
  const rawImage = property.imagen_principal || '';
  const cloudinaryOG = rawImage ? getCloudinaryOGImage(rawImage) : '';
  const ogImage = cloudinaryOG || `${siteUrl}/api/og/propiedad/${property.slug}`;

  const title = generatePropertyTitle(property);
  const description = generatePropertyDescription(property);
  const ogDescription = generatePropertyOGDescription(property);

  return {
    title,
    description,
    alternates: {
      canonical: propertyUrl
    },
    openGraph: {
      title,
      description: ogDescription,
      url: propertyUrl,
      siteName: SITE_NAME,
      locale: LOCALE,
      images: [{
        url: ogImage,
        width: 1200,
        height: 630,
        alt: `${getTipoDisplay(property.tipo)} en ${getOperacionText(property.operacion)} en ${getBarrioDisplay(property.barrio)}`
      }],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: ogDescription,
      images: [ogImage]
    },
    jsonLd: generatePropertyJSONLD(property, siteUrl)
  };
}

export function generateBarrioTitle(
  barrio: string,
  ciudad: string,
  totalCount: number,
  operacion?: string
): string {
  const barrioDisplay = getBarrioDisplay(barrio);
  const ciudadDisplay = getCiudadDisplay(ciudad);

  if (operacion) {
    return `Inmuebles en ${operacion.toLowerCase()} en ${barrioDisplay}, ${ciudadDisplay} | ${totalCount} propiedades | ${BRAND}`;
  }

  return `Inmuebles en ${barrioDisplay}, ${ciudadDisplay} | ${totalCount} propiedades | ${BRAND}`;
}

export function generateBarrioDescription(
  barrio: string,
  ciudad: string,
  totalCount: number,
  operacion?: string
): string {
  const barrioDisplay = getBarrioDisplay(barrio);
  const ciudadDisplay = getCiudadDisplay(ciudad);

  const operacionText = operacion ? `en ${operacion.toLowerCase()}` : '';
  const description = `Descubre ${totalCount} inmuebles ${operacionText} en ${barrioDisplay}, ${ciudadDisplay}. ` +
    `Explora opciones de vivienda en una de las zonas más valorizadas del norte de Santander. ` +
    `Inmobiliaria Tucasa Los Patios, tu mejor opción en finca raíz.`;

  return truncate(description, 155);
}

export function generateBarrioOGDescription(
  barrio: string,
  ciudad: string,
  totalCount: number
): string {
  const barrioDisplay = getBarrioDisplay(barrio);
  const ciudadDisplay = getCiudadDisplay(ciudad);

  return `${totalCount} inmuebles en ${barrioDisplay}, ${ciudadDisplay} | Tucasa Los Patios`;
}

export function generateBarrioJSONLD(
  barrio: string,
  ciudad: string,
  totalCount: number,
  siteUrl: string,
  barrioSlug: string
): Record<string, unknown> {
  siteUrl = normalizeSiteUrl(siteUrl);
  const barrioUrl = buildBarrioURL(barrioSlug, siteUrl);

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${barrioUrl}#page`,
        'name': `Inmuebles en ${getBarrioDisplay(barrio)}, ${getCiudadDisplay(ciudad)}`,
        'description': generateBarrioDescription(barrio, ciudad, totalCount),
        'url': barrioUrl,
        'about': {
          '@type': 'Place',
          'name': getBarrioDisplay(barrio),
          'address': {
            '@type': 'PostalAddress',
            'addressLocality': getCiudadDisplay(ciudad),
            'addressRegion': 'Norte de Santander',
            'addressCountry': 'CO'
          }
        },
        'mainEntity': {
          '@type': 'ItemList',
          'name': `Propiedades en ${getBarrioDisplay(barrio)}`,
          'numberOfItems': totalCount
        }
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${barrioUrl}#breadcrumb`,
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Inicio', 'item': siteUrl },
          { '@type': 'ListItem', 'position': 2, 'name': `${getCiudadDisplay(ciudad)}`, 'item': `${siteUrl}/${ciudad.toLowerCase().replace(/\s+/g, '-')}` },
          { '@type': 'ListItem', 'position': 3, 'name': getBarrioDisplay(barrio), 'item': barrioUrl }
        ]
      }
    ]
  };
}

export interface BarrioSEOContext {
  siteUrl: string;
}

export function generateBarrioSEO(
  barrio: string,
  ciudad: string,
  totalCount: number,
  barrioSlug: string,
  context: BarrioSEOContext = { siteUrl: SITE_URL },
  operacion?: string
): SEOOutput {
  const { siteUrl: rawSiteUrl } = context;
  const siteUrl = normalizeSiteUrl(rawSiteUrl);
  const barrioUrl = buildBarrioURL(barrioSlug, siteUrl);

  const title = generateBarrioTitle(barrio, ciudad, totalCount, operacion);
  const description = generateBarrioDescription(barrio, ciudad, totalCount, operacion);
  const ogDescription = generateBarrioOGDescription(barrio, ciudad, totalCount);

  return {
    title,
    description,
    alternates: {
      canonical: barrioUrl
    },
    openGraph: {
      title,
      description: ogDescription,
      url: barrioUrl,
      siteName: SITE_NAME,
      locale: LOCALE,
      images: [{
        url: `${siteUrl}/api/og/barrio/${barrioSlug}`,
        width: 1200,
        height: 630,
        alt: `Inmuebles en ${getBarrioDisplay(barrio)}, ${getCiudadDisplay(ciudad)}`
      }],
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: ogDescription,
      images: [`${siteUrl}/api/og/barrio/${barrioSlug}`]
    },
    jsonLd: generateBarrioJSONLD(barrio, ciudad, totalCount, siteUrl, barrioSlug)
  };
}

export { BRAND, SITE_NAME, LOCALE };
