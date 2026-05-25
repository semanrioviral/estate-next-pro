const https = require('https');

const CLOUD_NAME = 'dwdlmbftw';
const API_KEY = '947632195346871';
const API_SECRET = 'xsr_X8LLPAKCyK5p7zbdldi-8wQ';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaGFqemxydnF2aXJ0c3Vic2RxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDkzOTU5MiwiZXhwIjoyMDg2NTE1NTkyfQ.Nu-MXHv32NU7fPvtqfzC7QZ0IZ4Q48RJF0r7_kOaEPI';

function cloudinary(path, method, body) {
    return new Promise((resolve, reject) => {
        const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');
        const opts = {
            hostname: 'api.cloudinary.com', path: `/v1_1/${CLOUD_NAME}${path}`,
            method: method || 'GET',
            headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/json' }
        };
        const req = https.request(opts, res => {
            let d = ''; res.on('data', c => d += c);
            res.on('end', () => { try { resolve(JSON.parse(d)) } catch { resolve({ raw: d.slice(0, 500) }) } });
        });
        req.on('error', reject);
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

function supabase(path) {
    return new Promise(resolve => {
        https.get({
            hostname: 'uehajzlrvqvirtsubsdq.supabase.co', path,
            headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
        }, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve(JSON.parse(d))) });
    });
}

(async () => {
    console.log('🔍 Buscando imágenes en Cloudinary y Supabase...\n');

    // 1. Get all Cloudinary images in properties folder
    console.log('1. Listando Cloudinary...');
    let cloudImages = [];
    let nextCursor = null;
    do {
        const path = `/resources/image/upload?prefix=properties&max_results=100${nextCursor ? `&next_cursor=${nextCursor}` : ''}`;
        const res = await cloudinary(path);
        const resources = res.resources || [];
        for (var i = 0; i < resources.length; i++) {
            cloudImages.push(resources[i]);
        }
        nextCursor = res.next_cursor;
    } while (nextCursor);
    console.log(`   ${cloudImages.length} imágenes en Cloudinary (carpeta properties/)`);

    // 2. Get all Supabase property images
    console.log('2. Listando Supabase...');
    const [propImages, props] = await Promise.all([
        supabase('/rest/v1/property_images?select=url&limit=1000'),
        supabase('/rest/v1/properties?select=imagen_principal&limit=200'),
    ]);

    const supabaseUrls = new Set();
    (propImages || []).forEach(function(p) { supabaseUrls.add(p.url); });
    (props || []).forEach(function(p) { if (p.imagen_principal) supabaseUrls.add(p.imagen_principal); });
    console.log(`   ${supabaseUrls.size} URLs en Supabase (propiedades + galería)`);

    // 3. Find orphans (in Cloudinary but not in Supabase)
    const orphans = cloudImages.filter(img => !supabaseUrls.has(img.secure_url));
    console.log(`\n📊 RESULTADO:`);
    console.log(`   Cloudinary: ${cloudImages.length}`);
    console.log(`   Supabase:   ${supabaseUrls.size}`);
    console.log(`   Huérfanas:  ${orphans.length} (en Cloudinary pero sin propiedad)`);

    // 4. Delete orphans
    if (orphans.length > 0) {
        console.log(`\n🗑️ Eliminando ${orphans.length} imágenes huérfanas...`);
        let deleted = 0;
        for (const img of orphans) {
            try {
                const publicId = img.public_id;
                const body = { public_ids: [publicId], invalidate: true };
                await cloudinary('/resources/image/upload', 'DELETE', body);
                deleted++;
                if (deleted % 10 === 0) process.stdout.write(`   ${deleted}/${orphans.length}...\n`);
            } catch (e) { console.error('   Error:', img.public_id); }
        }
        console.log(`   ✅ ${deleted} eliminadas`);
    }

    // 5. Regenerate referenced images (apply quality:auto, fetch_format:auto)
    var referenced = [];
    for (var i = 0; i < cloudImages.length; i++) {
        if (supabaseUrls.has(cloudImages[i].secure_url)) {
            referenced.push(cloudImages[i]);
        }
    }
    console.log(`\n🔄 Regenerando ${referenced.length} imágenes con compresión...`);

    // Use explicit API to regenerate with eager transformations
    // Cloudinary explicit API: apply eager transformation to existing images
    let regenerated = 0;
    for (const img of referenced) {
        try {
            await cloudinary('/image/upload', 'POST', {
                public_id: img.public_id,
                quality: 'auto',
                fetch_format: 'auto',
                invalidate: true,
                overwrite: true,
            });
            regenerated++;
            if (regenerated % 10 === 0) process.stdout.write(`   ${regenerated}/${referenced.length}...\n`);
        } catch (e) { /* skip errors - some might not need regeneration */ }
    }
    console.log(`   ✅ ${regenerated} regeneradas con compresión`);

    // 6. Summary
    var totalSizeBefore = 0;
    for (var i = 0; i < cloudImages.length; i++) {
        totalSizeBefore += (cloudImages[i].bytes || 0);
    }
    console.log(`\n═══════════════════════════════`);
    console.log(`  ✅ LIMPIEZA COMPLETADA`);
    console.log(`═══════════════════════════════`);
    console.log(`  Total antes: ${cloudImages.length} imágenes`);
    console.log(`  Huérfanas eliminadas: ${orphans.length}`);
    console.log(`  Regeneradas con WebP/compresión: ${regenerated}`);
    console.log(`  Referenciadas (se mantienen): ${referenced.length}`);
    console.log(`  Peso aprox original: ${(totalSizeBefore / 1024 / 1024).toFixed(0)} MB`);
})();
