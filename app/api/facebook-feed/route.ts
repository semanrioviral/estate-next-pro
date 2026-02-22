import 'server-only';

import { unstable_cache } from 'next/cache';
import { NextResponse } from 'next/server';

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
            .eq('estado', 'Disponible')
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

function toAbsoluteUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
        return url;
    }

    const normalized = url.startsWith('/') ? url : `/${url}`;
    return `${BASE_URL}${normalized}`;
}

function mapAvailability(operacion: string | null | undefined): 'for_sale' | 'for_rent' {
    return operacion === 'arriendo' ? 'for_rent' : 'for_sale';
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

export async function GET(): Promise<NextResponse> {
    const properties = await getFeedProperties();

    const items = properties
        .filter((property) => Boolean(property.imagen_principal))
        .map((property) => {
            const availability = mapAvailability(property.operacion);
            const propertyType = mapPropertyType(property.tipo);
            const title = property.titulo || 'Propiedad disponible';
            const description = property.descripcion_corta || property.descripcion || title;
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

    return new NextResponse(xml, {
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
        },
    });
}
