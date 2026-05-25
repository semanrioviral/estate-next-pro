const https = require('https');
const fs = require('fs');

const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaGFqemxydnF2aXJ0c3Vic2RxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDkzOTU5MiwiZXhwIjoyMDg2NTE1NTkyfQ.Nu-MXHv32NU7fPvtqfzC7QZ0IZ4Q48RJF0r7_kOaEPI';
const HOST = 'uehajzlrvqvirtsubsdq.supabase.co';

// Parse the AI-generated property
let raw = fs.readFileSync('scripts/generated-property.json', 'utf8');
// Strip BOM if present
if (raw.charCodeAt(0) === 0xFEFF) raw = raw.slice(1);
const data = JSON.parse(raw);
const p = data.property;

// Use real Unsplash images for a luxury house
const images = [
    { url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&q=80", orden: 0, es_principal: true },
    { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80", orden: 1, es_principal: false },
    { url: "https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1200&q=80", orden: 2, es_principal: false },
    { url: "https://images.unsplash.com/photo-1600566753086-00f18f6b0050?w=1200&q=80", orden: 3, es_principal: false },
    { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80", orden: 4, es_principal: false },
    { url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80", orden: 5, es_principal: false },
    { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80", orden: 6, es_principal: false },
    { url: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1200&q=80", orden: 7, es_principal: false },
];

function api(method, path, body) {
    return new Promise(resolve => {
        const opts = { hostname: HOST, path, method, headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' } };
        const req = https.request(opts, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => { try { resolve({ status: res.statusCode, data: JSON.parse(d) }); } catch { resolve({ status: res.statusCode, text: d.slice(0, 200) }); } }); });
        req.on('error', e => resolve({ error: e.message }));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

(async () => {
    console.log('🏠 Creando propiedad generada por IA...\n');

    const property = {
        titulo: p.titulo,
        descripcion: p.descripcion,
        descripcion_corta: p.descripcion_corta,
        ciudad: p.ciudad,
        barrio: p.barrio,
        direccion: p.direccion || null,
        precio: p.precio,
        moneda: p.moneda || 'COP',
        negociable: p.negociable ?? false,
        estado: 'Disponible',
        operacion: p.operacion || 'venta',
        tipo: p.tipo || 'casa',
        habitaciones: p.habitaciones || 0,
        "baños": p.baños || 0,
        parqueaderos: p.parqueaderos || 0,
        area_m2: p.area_m2 || 0,
        medidas_lote: p.medidas_lote || null,
        tipo_uso: p.tipo_uso || 'Residencial',
        año_construccion: p.año_construccion || null,
        antigüedad: p.antigüedad || null,
        estrato: p.estrato || null,
        canon_administracion: p.canon_administracion || null,
        codigo_postal: p.codigo_postal || null,
        financiamiento: p.financiamiento || null,
        destacado: true,
        servicios: p.servicios || [],
        etiquetas: p.etiquetas || [],
        imagen_principal: images[0].url,
        slug: p.slug,
        meta_titulo: p.meta_titulo,
        meta_descripcion: p.meta_descripcion,
        canonical: p.canonical,
    };

    console.log('📝 Título:', property.titulo);
    console.log('📍', property.barrio + ', ' + property.ciudad);
    console.log('💰 $' + Number(property.precio).toLocaleString('es-CO'));
    console.log('🛏️', property.habitaciones, 'hab | 🛁', property["baños"], 'baños | 📐', property.area_m2, 'm²');
    console.log('🏷️', (property.servicios || []).join(', '));
    console.log('🔗 Slug:', property.slug);
    console.log('');

    // 1. Insert property
    console.log('1. Insertando propiedad...');
    let r = await api('POST', '/rest/v1/properties', property);
    const propId = Array.isArray(r.data) ? r.data[0]?.id : r.data?.id;
    
    if (propId) {
        console.log('   ✅ Propiedad creada. ID:', propId);

        // 2. Insert images
        console.log('2. Insertando ' + images.length + ' imágenes...');
        const imgRecords = images.map(img => ({ ...img, property_id: propId }));
        r = await api('POST', '/rest/v1/property_images', imgRecords);
        console.log('   ✅', Array.isArray(r.data) ? r.data.length : '?', 'imágenes insertadas');

        // 3. Verify
        r = await api('GET', `/rest/v1/properties?id=eq.${propId}&select=titulo,slug,imagen_principal,precio`);
        const final = Array.isArray(r.data) ? r.data[0] : null;
        
        console.log('\n═══════════════════════════════');
        console.log('  ✅ ¡PROPIEDAD PUBLICADA!');
        console.log('═══════════════════════════════');
        console.log('  Título:', final?.titulo);
        console.log('  Slug:', final?.slug);
        console.log('  Precio: $' + Number(final?.precio).toLocaleString('es-CO'));
        console.log('  ID:', propId);
        console.log('');
        console.log('  🌐 Ver en:');
        console.log('  https://tucasalospatios.com/propiedades/' + final?.slug);
        console.log('  http://localhost:3000/propiedades/' + final?.slug);
    } else {
        console.log('   ❌ Error al crear:', JSON.stringify(r).slice(0, 300));
    }
})();
