const https = require('https');
const http = require('http');
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaGFqemxydnF2aXJ0c3Vic2RxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDkzOTU5MiwiZXhwIjoyMDg2NTE1NTkyfQ.Nu-MXHv32NU7fPvtqfzC7QZ0IZ4Q48RJF0r7_kOaEPI';

function postAI(text) {
    return new Promise(resolve => {
        const body = JSON.stringify({ text });
        const req = http.request({ hostname: 'localhost', port: 3000, path: '/api/ai/generate', method: 'POST', headers: { 'Content-Type': 'application/json' } }, res => {
            let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d).property));
        });
        req.write(body); req.end();
    });
}

function supabase(method, path, body) {
    return new Promise(resolve => {
        const opts = { hostname: 'uehajzlrvqvirtsubsdq.supabase.co', path, method, headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' } };
        const req = https.request(opts, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => { try { resolve({ status: res.statusCode, data: JSON.parse(d) }); } catch { resolve({ status: res.statusCode }); } }); });
        req.on('error', e => resolve({ error: e.message }));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

(async () => {
    console.log('🤖 Generando propiedad con IA...\n');
    const p = await postAI('Casa campestre en Los Patios, barrio La Garita. 350m², lote 500m². 5 habitaciones, 4 baños, sala comedor, cocina integral, estudio, terraza con vista a montañas, piscina, jacuzzi, BBQ, parqueadero 3 carros, jardín 200m² con árboles frutales. 2 pisos, acabados lujo, porcelanato, ventanales. Seguridad 24h. Precio 650 millones negociables. Escritura al día.');

    console.log('✅ IA generó:', p.titulo);
    console.log('   Has m²:', p.descripcion?.includes('m²'));
    console.log('   Has ñ:', (p.descripcion||'').includes('ñ') || (p.descripcion||'').includes('ño'));
    console.log('   Desc inicio:', p.descripcion?.slice(0, 100));

    const images = [
        "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
        "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&q=80",
        "https://images.unsplash.com/photo-1600566753086-00f18f6b0050?w=1200&q=80",
        "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
        "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
        "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80",
    ];

    const prop = {
        titulo: p.titulo, descripcion: p.descripcion, descripcion_corta: p.descripcion_corta,
        ciudad: p.ciudad, barrio: p.barrio, precio: p.precio, moneda: 'COP',
        negociable: p.negociable, estado: 'Disponible', operacion: p.operacion,
        tipo: p.tipo, habitaciones: p.habitaciones, baños: p.baños, parqueaderos: p.parqueaderos,
        area_m2: p.area_m2, tipo_uso: p.tipo_uso, estrato: p.estrato,
        antigüedad: p.antigüedad, año_construccion: p.año_construccion,
        canon_administracion: p.canon_administracion, financiamiento: p.financiamiento,
        destacado: true, servicios: p.servicios, etiquetas: p.etiquetas,
        imagen_principal: images[0], slug: p.slug,
        meta_titulo: p.meta_titulo, meta_descripcion: p.meta_descripcion, canonical: p.canonical,
    };

    console.log('\n📤 Publicando en Supabase...');
    const r = await supabase('POST', '/rest/v1/properties', prop);
    const propId = Array.isArray(r.data) ? r.data[0]?.id : r.data?.id;

    if (propId) {
        const imgRecords = images.map((url, i) => ({ url, orden: i, es_principal: i === 0, property_id: propId }));
        await supabase('POST', '/rest/v1/property_images', imgRecords);

        // Verify encoding
        const v = await supabase('GET', `/rest/v1/properties?id=eq.${propId}&select=descripcion,meta_titulo`);
        const txt = Array.isArray(v.data) ? v.data[0]?.descripcion : '';
        console.log('\n═══════════════════════════════════');
        console.log('  ✅ PROPIEDAD PUBLICADA');
        console.log('═══════════════════════════════════');
        console.log('  Encoding check:');
        console.log('  m² correcto?:', txt?.includes('m²'));
        console.log('  ñ correcto?:', (txt||'').includes('ñ') || (txt||'').includes('ño'));
        console.log('  construcción?:', txt?.includes('construcción'));
        console.log('  baños?:', txt?.includes('baños'));
        console.log('  Slug:', p.slug);
        console.log('  URL: http://localhost:3000/propiedades/' + p.slug);
    }
})();
