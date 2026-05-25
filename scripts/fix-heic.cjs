const https = require('https');
const CLOUD = 'dwdlmbftw', APIK = '947632195346871', APIS = 'xsr_X8LLPAKCyK5p7zbdldi-8wQ';

function cloud(path, method, body) {
    return new Promise(resolve => {
        const auth = Buffer.from(`${APIK}:${APIS}`).toString('base64');
        const req = https.request({ hostname: 'api.cloudinary.com', path: `/v1_1/${CLOUD}${path}`, method: method || 'GET', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/json' } }, res => {
            let d = ''; res.on('data', c => d += c); res.on('end', () => { try { resolve(JSON.parse(d)) } catch { resolve({}) } });
        });
        req.on('error', e => { console.error(e); resolve({}); });
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

(async () => {
    console.log('🔍 Buscando imágenes HEIC...\n');
    
    // Get all images
    var all = [];
    var cursor = null;
    do {
        var path = `/resources/image/upload?prefix=properties&max_results=500${cursor ? '&next_cursor=' + cursor : ''}`;
        var r = await cloud(path);
        var resources = r.resources || [];
        for (var i = 0; i < resources.length; i++) all.push(resources[i]);
        cursor = r.next_cursor;
    } while (cursor);

    var heics = [];
    for (var i = 0; i < all.length; i++) {
        if (all[i].format === 'heic' || all[i].format === 'heif') {
            heics.push(all[i]);
        }
    }

    console.log('Total imágenes:', all.length);
    console.log('HEIC/HEIF:', heics.length);

    if (heics.length === 0) {
        console.log('✅ No hay imágenes HEIC.');
        return;
    }

    // Show them
    for (var i = 0; i < heics.length; i++) {
        console.log('  -', heics[i].public_id, (heics[i].bytes / 1024 / 1024).toFixed(1) + 'MB');
    }

    // Convert to JPG
    console.log('\n🔄 Convirtiendo a JPG...');
    var converted = 0;
    for (var i = 0; i < heics.length; i++) {
        try {
            var body = {
                public_id: heics[i].public_id,
                format: 'jpg',
                quality: 'auto',
                invalidate: true,
                overwrite: true,
            };
            await cloud('/image/upload', 'POST', body);
            converted++;
            process.stdout.write(`   ${converted}/${heics.length}\r`);
        } catch(e) {}
    }
    console.log(`\n✅ ${converted} imágenes convertidas a JPG`);
})();
