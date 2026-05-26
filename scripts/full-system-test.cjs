const https = require('https');
const http = require('http');
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || (() => { throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurada'); })();
const SUPABASE = 'uehajzlrvqvirtsubsdq.supabase.co';
const LOCAL = 'localhost:3000';
const TEST_PROPERTY_ID = '152ca562-9a49-464a-8f23-eff935f12b9a';
const results = [];

function api(method, path, body) {
    return new Promise(resolve => {
        const opts = { hostname: SUPABASE, path, method, headers: { apikey: SERVICE_KEY, Authorization: `Bearer ${SERVICE_KEY}`, 'Content-Type': 'application/json', Prefer: 'return=representation' } };
        const req = https.request(opts, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => { try { resolve({ status: res.statusCode, data: JSON.parse(d) }); } catch { resolve({ status: res.statusCode, text: d.slice(0, 200) }); } }); });
        req.on('error', e => resolve({ error: e.message }));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

function page(url) {
    return new Promise(resolve => {
        const req = http.get(`http://${LOCAL}${url}`, res => { let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ status: res.statusCode, hasError: d.includes('error') || d.includes('Application error') || d.includes('not found'), title: (d.match(/<title>([^<]+)<\/title>/) || [])[1] || 'NO TITLE' })); });
        req.on('error', e => resolve({ error: e.message }));
    });
}

(async () => {
    console.log('═══════════════════════════════════════════');
    console.log('  PRUEBAS COMPLETAS DEL SISTEMA');
    console.log('═══════════════════════════════════════════\n');

    // 1. DB Tests
    console.log('─── 1. BASE DE DATOS ───');
    
    let r = await api('GET', '/rest/v1/advisory_requests?select=id&limit=1');
    console.log(r.status === 200 ? '✅ advisory_requests accesible' : '❌ advisory_requests ERROR: ' + r.status);
    
    r = await api('GET', '/rest/v1/property_views?select=id&limit=1');
    console.log(r.status === 200 ? '✅ property_views accesible' : r.status === 400 ? '⚠️ property_views sin datos (esperado)' : '❌ property_views ERROR: ' + r.status);
    
    r = await api('GET', '/rest/v1/properties?select=id&limit=1');
    console.log(r.status === 200 ? '✅ properties accesible' : '❌ properties ERROR: ' + r.status);
    
    r = await api('GET', '/rest/v1/profiles?select=id&limit=1');
    console.log(r.status === 200 ? '✅ profiles accesible' : '❌ profiles ERROR: ' + r.status);

    // 2. READ: Get property
    console.log('\n─── 2. LECTURA DE PROPIEDAD ───');
    r = await api('GET', `/rest/v1/properties?id=eq.${TEST_PROPERTY_ID}&select=id,titulo,precio,estrato,canon_administracion,año_construccion,antigüedad,estado,slug`);
    const prop = Array.isArray(r.data) ? r.data[0] : r.data;
    console.log(prop ? `✅ Propiedad: ${prop.titulo?.slice(0,50)}` : '❌ Propiedad no encontrada');
    if (prop) {
        console.log(`   Precio: $${prop.precio} | Estrato: ${prop.estrato} | Canon: ${prop.canon_administracion} | Año: ${prop.año_construccion} | Antig: ${prop.antigüedad}`);
    }

    // 3. UPDATE property
    console.log('\n─── 3. ACTUALIZAR PROPIEDAD ───');
    const newEstrato = Math.floor(Math.random() * 6) + 1;
    r = await api('PATCH', `/rest/v1/properties?id=eq.${TEST_PROPERTY_ID}`, { estrato: newEstrato });
    console.log(r.status === 204 || r.status === 200 ? `✅ UPDATE exitoso (estrato → ${newEstrato})` : `❌ UPDATE falló: ${r.status} ${r.text || ''}`);
    
    // Verify
    r = await api('GET', `/rest/v1/properties?id=eq.${TEST_PROPERTY_ID}&select=estrato`);
    const updated = Array.isArray(r.data) ? r.data[0] : null;
    console.log(updated?.estrato === newEstrato ? `✅ Verificación: estrato = ${updated.estrato}` : `❌ Verificación falló: ${updated?.estrato} != ${newEstrato}`);

    // 4. CREATE lead (simula WhatsApp click)
    console.log('\n─── 4. CRM: CREAR LEAD (WhatsApp) ───');
    r = await api('POST', '/rest/v1/advisory_requests', {
        nombre: 'Test Automático WhatsApp',
        telefono: '3001112233',
        email: 'whatsapp@auto.tucasalospatios.com',
        mensaje: 'Interesado en: ' + (prop?.titulo || 'Propiedad test'),
        estado: 'pendiente',
        property_id: TEST_PROPERTY_ID
    });
    const leadId = Array.isArray(r.data) ? r.data[0]?.id : r.data?.id;
    console.log(leadId ? `✅ Lead creado: ${leadId}` : `❌ Lead NO creado: ${r.status} ${JSON.stringify(r).slice(0,150)}`);

    // 5. CRM: Move lead (simula pipeline)
    if (leadId) {
        console.log('\n─── 5. CRM: MOVER LEAD EN PIPELINE ───');
        r = await api('PATCH', `/rest/v1/advisory_requests?id=eq.${leadId}`, { estado: 'contactado', ultimo_contacto: new Date().toISOString() });
        console.log(r.status === 204 || r.status === 200 ? '✅ Lead movido a "contactado"' : `❌ Error: ${r.status}`);

        r = await api('PATCH', `/rest/v1/advisory_requests?id=eq.${leadId}`, { estado: 'visitando', ultimo_contacto: new Date().toISOString() });
        console.log(r.status === 204 || r.status === 200 ? '✅ Lead movido a "visitando"' : `❌ Error: ${r.status}`);

        // 6. CRM: Add note
        console.log('\n─── 6. CRM: AGREGAR NOTA ───');
        r = await api('PATCH', `/rest/v1/advisory_requests?id=eq.${leadId}`, { notas: '[Test] Llamada realizada. Cliente interesado en visitar sábado.\n[Test] Envié fotos adicionales.' });
        console.log(r.status === 204 || r.status === 200 ? '✅ Nota agregada' : `❌ Error: ${r.status} (columna notas existe?)`);

        // Verify notes
        r = await api('GET', `/rest/v1/advisory_requests?id=eq.${leadId}&select=notas,estado`);
        const lead = Array.isArray(r.data) ? r.data[0] : null;
        console.log(lead?.notas ? `✅ Verificación notas: "${lead.notas.slice(0,40)}..."` : '⚠️ Sin notas (columna puede no existir)');

        // Cleanup test lead
        console.log('\n─── 7. LIMPIEZA ───');
        r = await api('DELETE', `/rest/v1/advisory_requests?id=eq.${leadId}`);
        console.log(r.status === 204 || r.status === 200 ? '✅ Lead de prueba eliminado' : `⚠️ Cleanup: ${r.status}`);
    }

    // 8. DELETE property test (no eliminamos, solo verificamos que funcione)
    console.log('\n─── 8. ELIMINAR (verificación de API) ───');
    // Create temp property
    r = await api('POST', '/rest/v1/properties', {
        titulo: 'TEST DELETE',
        ciudad: 'Cucuta',
        precio: 1000,
        tipo: 'casa',
        slug: 'test-delete-' + Date.now(),
        operacion: 'venta'
    });
    const tempId = Array.isArray(r.data) ? r.data[0]?.id : r.data?.id;
    if (tempId) {
        r = await api('DELETE', `/rest/v1/properties?id=eq.${tempId}`);
        console.log(r.status === 204 || r.status === 200 ? '✅ DELETE funciona correctamente' : `❌ DELETE falló: ${r.status}`);
    } else {
        console.log('⚠️ No se pudo crear propiedad temporal para test DELETE');
    }

    // 9. Public pages
    console.log('\n─── 9. PÁGINAS PÚBLICAS ───');
    const pages = ['/', '/propiedades', '/venta', '/arriendo', '/propiedades/apartamento-moderno-caobos-cucuta-3-habitaciones', '/blog', '/contacto', '/nosotros', '/vender-casa-en-cucuta'];
    for (const p of pages) {
        const pr = await page(p);
        const icon = pr.status === 200 && !pr.hasError ? '✅' : pr.status === 307 ? '🔒' : '❌';
        console.log(`${icon} ${p.padEnd(55)} ${pr.status} ${pr.title?.slice(0,50) || ''}`);
    }

    // 10. Admin pages (expect redirect 307 to login)
    console.log('\n─── 10. PÁGINAS ADMIN (deben redirigir a login) ───');
    const adminPages = ['/admin', '/admin/propiedades', '/admin/crm', '/admin/solicitudes', '/admin/leads', '/admin/equipo', '/admin/propiedades/nuevo', `/admin/propiedades/editar/${TEST_PROPERTY_ID}`];
    for (const p of adminPages) {
        const pr = await page(p);
        const isRedirect = pr.status === 307;
        const icon = isRedirect ? '✅' : '⚠️';
        console.log(`${icon} ${p.padEnd(55)} ${pr.status} ${isRedirect ? '(redirect login - OK)' : pr.title?.slice(0,40) || ''}`);
    }

    // 11. Verify advisory_requests columns
    console.log('\n─── 11. VERIFICACIÓN DE COLUMNAS ───');
    r = await api('GET', '/rest/v1/advisory_requests?select=notas,ultimo_contacto&limit=1');
    if (r.status === 200) console.log('✅ Columnas notas y ultimo_contacto existen');
    else if (r.status === 400) console.log('⚠️ Columnas notas/ultimo_contacto NO existen - ejecutar SQL');
    else console.log(`❓ Status: ${r.status}`);

    console.log('\n═══════════════════════════════════════════');
    console.log('  PRUEBAS COMPLETADAS');
    console.log('═══════════════════════════════════════════');
})();
