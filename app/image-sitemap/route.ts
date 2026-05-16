import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase-server';

const SITE_URL = 'https://tucasalospatios.com';

export async function GET() {
    const supabase = createPublicClient();

    const { data: properties } = await supabase
        .from('properties')
        .select('slug, updated_at, imagen_principal, galeria, titulo')
        .not('imagen_principal', 'is', null);

    if (!properties || properties.length === 0) {
        return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"></urlset>', {
            headers: { 'Content-Type': 'application/xml' },
        });
    }

    const getAbsolute = (img: string) =>
        img.startsWith('http') ? img : `${SITE_URL}${img}`;

    const escXml = (s: string) =>
        s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

    const urls = properties.map((p) => {
        const allImages = [p.imagen_principal, ...(p.galeria || [])]
            .filter(Boolean)
            .slice(0, 5);

        const imageXml = allImages
            .map(
                (img) => `    <image:image>
      <image:loc>${escXml(getAbsolute(img))}</image:loc>
      <image:title>${escXml(p.titulo || 'Propiedad en venta')}</image:title>
    </image:image>`
            )
            .join('\n');

        return `  <url>
    <loc>${SITE_URL}/propiedades/${p.slug}</loc>
    <lastmod>${p.updated_at ? new Date(p.updated_at).toISOString() : new Date().toISOString()}</lastmod>
${imageXml}
  </url>`;
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.join('\n')}
</urlset>`;

    return new NextResponse(xml, {
        headers: { 'Content-Type': 'application/xml' },
    });
}
