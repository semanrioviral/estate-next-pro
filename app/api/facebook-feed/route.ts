import 'server-only';

import { unstable_cache } from 'next/cache';

import { attachImagesToProperties, type Property } from '@/lib/supabase/properties';
import { createPublicClient } from '@/lib/supabase-server';

const BASE_URL = 'https://tucasalospatios.com';
const FEED_SELECT_FIELDS: string = `
    id,
    titulo,
    descripcion,
    descripcion_corta,
    slug,
    imagen_principal,
    precio,
    operacion,
    tipo,
    habitaciones,
    baños,
    area_m2,
    ciudad,
    barrio,
    estado,
    created_at,
    updated_at
`;

const getFeedProperties = unstable_cache(
    async (): Promise<Property[]> => {
        const supabase = createPublicClient();

        const { data, error } = await supabase
            .from('properties')
            .select(FEED_SELECT_FIELDS)
            .not('estado', 'ilike', 'vendido')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('[facebook-feed] Error fetching properties:', error.message);
            return [];
        }

        return attachImagesToProperties((data ?? []) as unknown as Property[], supabase);
    },
    ['facebook-feed-v1'],
    { revalidate: 3600, tags: ['properties'] }
);

function escapeXml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;');
}

function cdata(value: string): string {
    return `<![CDATA[${value.replaceAll(']]>', ']]]]><![CDATA[>')}]]>`;
}

function truncateTitle(value: string, maxLength = 65): string {
    if (value.length <= maxLength) {
        return value;
    }
    return `${value.slice(0, maxLength - 3)}...`;
}

function toPlainTextDescription(value: string, maxLength = 5000): string {
    const withoutScriptAndStyle = value
        .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
        .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ');

    const withoutHtml = withoutScriptAndStyle
        .replace(/<br\s*\/?>/gi, ' ')
        .replace(/<[^>]+>/g, ' ');

    const normalizedEntities = withoutHtml
        .replace(/&nbsp;/gi, ' ')
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>');

    const withoutEmojis = normalizedEntities
        .replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F]/gu, '')
        .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, '');

    const cleaned = withoutEmojis.replace(/\s+/g, ' ').trim();
    return cleaned.slice(0, maxLength);
}

function toAbsoluteUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    const normalized = url.startsWith('/') ? url : `/${url}`;
    return `${BASE_URL}${normalized}`;
}

function mapAvailability(estado: string | null | undefined): 'in stock' | 'out of stock' {
    const normalized = (estado || '').trim().toLowerCase();

    switch (normalized) {
        case 'reservado':
        case 'vendido':
            return 'out of stock';
        case 'disponible':
        case 'en venta':
        case 'destacado':
        case 'en remate':
        default:
            return 'in stock';
    }
}

function mapPropertyType(tipo: string | null | undefined): string {
    switch (tipo) {
        case 'casa':
            return 'house';
        case 'apartamento':
            return 'apartment';
        case 'lote':
            return 'land';
        case 'comercial':
            return 'commercial';
        case 'proyecto':
            return 'new_development';
        default:
            return 'house';
    }
}

function formatPrice(value: number | null | undefined): string {
    if (typeof value !== 'number' || Number.isNaN(value)) {
        return '0 COP';
    }

    const rounded = Number.isInteger(value) ? value.toString() : value.toFixed(2);
    return `${rounded} COP`;
}

function tag(name: string, value: string): string {
    return `<${name}>${escapeXml(value)}</${name}>`;
}

function optionalTag(name: string, value: string | number | null | undefined): string {
    if (value === null || value === undefined || value === '') {
        return '';
    }
    return tag(name, String(value));
}

export async function GET(): Promise<Response> {
    const properties = await getFeedProperties();

    const items = properties
        .filter((property) => Boolean(property.imagen_principal))
        .map((property) => {
            const availability = mapAvailability(property.estado);
            const propertyType = mapPropertyType(property.tipo);
            const rawTitle = property.titulo || 'Propiedad disponible';
            const title = truncateTitle(rawTitle, 65);
            const rawDescription = property.descripcion_corta || property.descripcion || rawTitle;
            const description = toPlainTextDescription(rawDescription, 5000);
            const mainImage = toAbsoluteUrl(property.imagen_principal);
            const propertyLink = `${BASE_URL}/propiedades/${property.slug}`;

            const additionalImages = (property.galeria || [])
                .filter((imageUrl) => Boolean(imageUrl))
                .map((imageUrl) => toAbsoluteUrl(imageUrl))
                .filter((imageUrl) => imageUrl !== mainImage);

            const additionalImageTags = additionalImages
                .map((imageUrl) => tag('g:additional_image_link', imageUrl))
                .join('');

            return [
                '<item>',
                tag('g:id', property.id),
                `<g:title>${cdata(title)}</g:title>`,
                `<g:description>${cdata(description)}</g:description>`,
                tag('g:link', propertyLink),
                tag('g:image_link', mainImage),
                additionalImageTags,
                tag('g:price', formatPrice(property.precio)),
                tag('g:availability', availability),
                tag('g:property_type', propertyType),
                optionalTag('g:bedrooms', property.habitaciones),
                optionalTag('g:bathrooms', property.baños),
                optionalTag('g:area', property.area_m2),
                optionalTag('g:custom_label_2', property.ciudad),
                optionalTag('g:custom_label_3', property.barrio),
                optionalTag('g:custom_label_0', property.operacion),
                optionalTag('g:custom_label_1', property.tipo),
                tag('g:condition', 'new'),
                tag('g:country', 'CO'),
                tag('g:content_language', 'es'),
                '</item>',
            ].join('');
        })
        .join('');

    const xml = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">',
        '<channel>',
        '<title>Tucasa Los Patios - Catálogo de Propiedades</title>',
        `<link>${BASE_URL}</link>`,
        '<description>Inventario actualizado automáticamente</description>',
        items,
        '</channel>',
        '</rss>',
    ].join('');

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
        },
    });
}
