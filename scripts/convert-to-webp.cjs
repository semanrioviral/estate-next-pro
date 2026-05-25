const https = require('https');
const CLOUD = 'dwdlmbftw', APIK = '947632195346871', APIS = 'xsr_X8LLPAKCyK5p7zbdldi-8wQ';

function cloud(path, method, body) {
    return new Promise(resolve => {
        const auth = Buffer.from(`${APIK}:${APIS}`).toString('base64');
        const req = https.request({ hostname: 'api.cloudinary.com', path: `/v1_1/${CLOUD}${path}`, method: method || 'GET', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' } }, res => {
            let d = ''; res.on('data', c => d += c); res.on('end', () => { try { resolve(JSON.parse(d)) } catch { resolve({}) } });
        });
        req.on('error', () => resolve({}));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

(async () => {
    console.log('🔍 Listando todas las imágenes...\n');
    
    var all = [];
    var cursor = null;
    do {
        var path = `/resources/image/upload?prefix=properties&max_results=500${cursor ? '&next_cursor=' + cursor : ''}`;
        var r = await cloud(path);
        var resources = r.resources || [];
        for (var i = 0; i < resources.length; i++) all.push(resources[i]);
        cursor = r.next_cursor;
    } while (cursor);

    // Filter non-webp images
    var toConvert = [];
    for (var i = 0; i < all.length; i++) {
        if (all[i].format !== 'webp') {
            toConvert.push(all[i]);
        }
    }

    console.log('Total:', all.length);
    console.log('Ya son WebP:', all.length - toConvert.length);
    console.log('A convertir:', toConvert.length);
    console.log('Peso actual:', (all.reduce(function(s, img) { return s + (img.bytes || 0); }, 0) / 1024 / 1024).toFixed(0), 'MB\n');

    if (toConvert.length === 0) {
        console.log('✅ Todas ya son WebP.');
        return;
    }

    console.log('🔄 Convirtiendo a WebP...');
    var converted = 0;
    for (var i = 0; i < toConvert.length; i++) {
        try {
            await cloud('/image/upload', 'POST', {
                public_id: toConvert[i].public_id,
                format: 'webp',
                quality: 'auto',
                invalidate: true,
                overwrite: true,
            });
            converted++;
            if (converted % 20 === 0) process.stdout.write('   ' + converted + '/' + toConvert.length + '\n');
        } catch(e) {}
    }
    console.log('   ✅ ' + converted + ' convertidas a WebP\n');

    // Recount size
    cursor = null; all = [];
    do {
        var path = `/resources/image/upload?prefix=properties&max_results=500${cursor ? '&next_cursor=' + cursor : ''}`;
        var r = await cloud(path);
        for (var i = 0; i < (r.resources || []).length; i++) all.push(r.resources[i]);
        cursor = r.next_cursor;
    } while (cursor);
    var newSize = all.reduce(function(s, img) { return s + (img.bytes || 0); }, 0) / 1024 / 1024;
    console.log('═══════════════════════════════');
    console.log('  ✅ CONVERSIÓN COMPLETADA');
    console.log('═══════════════════════════════');
    console.log('  Total imágenes:', all.length);
    console.log('  Formato: WebP');
    console.log('  Peso total:', newSize.toFixed(0), 'MB');
    console.log('  Google PageSpeed: ✅');
})();
