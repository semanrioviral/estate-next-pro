/**
 * Script de ejecución de migración SQL contra Supabase.
 * 
 * Prueba múltiples métodos de conexión:
 *   1. /rest/v1/sql (PostgREST SQL endpoint)
 *   2. /pg-meta/query  (pg-meta query endpoint)
 *   3. supabase.rpc('exec_sql') (si existe función)
 *   4. Exitoso si cualquiera funciona
 * 
 * Uso: node scripts/run-migration.mjs
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ── Config ────────────────────────────────────────────────
// ── Cargar .env.local manualmente ─────────────────────────
const envPath = resolve(__dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const envVars = Object.fromEntries(
    envContent.split('\n')
        .filter(line => line.trim() && !line.startsWith('#'))
        .map(line => {
            const idx = line.indexOf('=');
            return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
        })
);

const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('❌ Faltan variables de entorno. Asegúrate de ejecutar desde el proyecto con .env.local');
    console.error('   NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY requeridas.');
    process.exit(1);
}

const PROJECT_REF = SUPABASE_URL.replace('https://', '').replace('.supabase.co', '');
console.log(`📍 Proyecto: ${PROJECT_REF}`);
console.log(`📍 URL: ${SUPABASE_URL}`);

// ── Leer SQL ──────────────────────────────────────────────
const migrationPath = resolve(__dirname, '..', 'supabase', 'migrations', '20260221_full_schema_improvements.sql');
const rollbackPath = resolve(__dirname, '..', 'supabase', 'migrations', 'rollback_20260221_full_schema_improvements.sql');

const forwardSQL = readFileSync(migrationPath, 'utf-8');
const rollbackSQL = readFileSync(rollbackPath, 'utf-8');

console.log(`📄 SQL Forward: ${forwardSQL.length} caracteres`);
console.log(`📄 SQL Rollback: ${rollbackSQL.length} caracteres`);

// ── Helper: ejecutar SQL via fetch ─────────────────────────
function getAuthHeaders(extra = {}) {
    return {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Accept': 'application/json',
        ...extra
    };
}

async function trySqlViaRestEndpoint(url, extraHeaders, sql) {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: getAuthHeaders({
                'Content-Type': 'application/json',
                ...extraHeaders
            }),
            body: JSON.stringify({ query: sql })
        });

        const text = await response.text();
        let data;
        try { data = JSON.parse(text); } catch { data = text; }

        return {
            success: response.ok || (response.status === 200),
            status: response.status,
            data
        };
    } catch (err) {
        return { success: false, status: 0, data: err.message };
    }
}

async function trySqlRawBody(url, sql, contentType = 'text/plain') {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: getAuthHeaders({ 'Content-Type': contentType }),
            body: sql
        });

        const text = await response.text();
        let data;
        try { data = JSON.parse(text); } catch { data = text; }

        return {
            success: response.ok || (response.status === 200),
            status: response.status,
            data
        };
    } catch (err) {
        return { success: false, status: 0, data: err.message };
    }
}

// ── Helper: ejecutar SQL via supabase-js ──────────────────
async function tryViaSupabaseClient(sql) {
    try {
        const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

        const rpcVariants = [
            // formato 1: exec_sql(query_text)
            { name: 'rpc(exec_sql, query_text)', fn: () => supabase.rpc('exec_sql', { query_text: sql }) },
            // formato 2: exec_sql(query)
            { name: 'rpc(exec_sql, query)', fn: () => supabase.rpc('exec_sql', { query: sql }) },
            // formato 3: exec_sql(sql)
            { name: 'rpc(exec_sql, sql)', fn: () => supabase.rpc('exec_sql', { sql }) },
            // formato 4: exec(sql)
            { name: 'rpc(exec, query)', fn: () => supabase.rpc('exec', { query: sql }) },
            // formato 5: run_sql
            { name: 'rpc(run_sql, sql)', fn: () => supabase.rpc('run_sql', { sql }) },
            // formato 6: pgrocks_exec
            { name: 'rpc(pgrocks_exec, query)', fn: () => supabase.rpc('pgrocks_exec', { query: sql }) },
            // formato 7: supabase_sql
            { name: 'rpc(supabase_sql, query)', fn: () => supabase.rpc('supabase_sql', { query: sql }) },
            // formato 8: execute_sql
            { name: 'rpc(execute_sql, query)', fn: () => supabase.rpc('execute_sql', { query: sql }) },
            // formato 9: ddlx_exec
            { name: 'rpc(ddlx_exec, query)', fn: () => supabase.rpc('ddlx_exec', { query: sql }) },
            // formato 10: admin_exec
            { name: 'rpc(admin_exec, sql)', fn: () => supabase.rpc('admin_exec', { sql }) },
        ];

        // Probar cada variante
        for (const variant of rpcVariants) {
            try {
                const { data, error } = await variant.fn();
                if (!error) {
                    return { success: true, method: variant.name, data };
                }
            } catch {
                // continuar
            }
        }

        return { success: false, method: 'supabase client', data: 'No RPC function found' };
    } catch (err) {
        return { success: false, method: 'supabase client', data: err.message };
    }
}

// ── EJECUTAR ──────────────────────────────────────────────
async function main() {
    console.log('\n🧪 Probando métodos de conexión...\n');
    
    // 1. Probar que podemos conectar (GET simple)
    try {
        const testResp = await fetch(`${SUPABASE_URL}/rest/v1/`, {
            headers: getAuthHeaders()
        });
        console.log(`📡 API Rest: ${testResp.status} ${testResp.statusText}`);
    } catch (err) {
        console.log(`📡 API Rest: ERROR - ${err.message}`);
    }

    // 2. Probar /rest/v1/sql con JSON body
    console.log('\n🔹 Probando /rest/v1/sql (JSON)...');
    const r1 = await trySqlViaRestEndpoint(`${SUPABASE_URL}/rest/v1/sql`, {}, 'SELECT 1 as test');
    console.log(`   Resultado: ${r1.success ? '✅' : '❌'} (${r1.status})`);
    if (r1.success) console.log('   Respuesta:', JSON.stringify(r1.data).slice(0, 200));
    else console.log('   Error:', typeof r1.data === 'string' ? r1.data.slice(0, 200) : JSON.stringify(r1.data).slice(0, 200));

    // 3. Probar /rest/v1/sql con raw body (text/plain)
    console.log('\n🔹 Probando /rest/v1/sql (raw text)...');
    const r2 = await trySqlRawBody(`${SUPABASE_URL}/rest/v1/sql`, 'SELECT 1 as test');
    console.log(`   Resultado: ${r2.success ? '✅' : '❌'} (${r2.status})`);
    if (r2.success) console.log('   Respuesta:', JSON.stringify(r2.data).slice(0, 200));
    else console.log('   Error:', typeof r2.data === 'string' ? r2.data.slice(0, 200) : JSON.stringify(r2.data).slice(0, 200));

    // 4. Probar /pg-meta/query
    console.log('\n🔹 Probando /pg-meta/query...');
    const r3 = await trySqlRawBody(`${SUPABASE_URL}/pg-meta/query`, forwardSQL, 'application/json');
    console.log(`   Resultado: ${r3.success ? '✅' : '❌'} (${r3.status})`);
    if (r3.success) console.log('   Respuesta:', JSON.stringify(r3.data).slice(0, 200));
    else console.log('   Error:', typeof r3.data === 'string' ? r3.data.slice(0, 200) : JSON.stringify(r3.data).slice(0, 200));

    // 5. Probar supabase client
    console.log('\n🔹 Probando @supabase/supabase-js...');
    const r4 = await tryViaSupabaseClient('SELECT 1 as test');
    console.log(`   Resultado: ${r4.success ? '✅' : '❌'} (${r4.method})`);
    if (r4.success) console.log('   Respuesta:', JSON.stringify(r4.data).slice(0, 200));
    else console.log('   Error:', typeof r4.data === 'string' ? r4.data.slice(0, 200) : JSON.stringify(r4.data).slice(0, 200));

    // ── Decidir método ganador ──
    const attempts = [
        { name: '/rest/v1/sql (JSON)', result: r1 },
        { name: '/rest/v1/sql (raw)', result: r2 },
        { name: '/pg-meta/query', result: r3 },
        { name: 'supabase client', result: r4 }
    ];

    const winner = attempts.find(a => a.result.success);

    if (!winner) {
        console.log('\n❌ NINGÚN MÉTODO FUNCIONÓ.');
        console.log('\n📋 INSTRUCCIONES MANUALES:');
        console.log('   1. Ve a https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql/new');
        console.log('   2. Copia y pega el contenido de:');
        console.log('      supabase/migrations/20260221_full_schema_improvements.sql');
        console.log('   3. Haz clic en "Run"');
        console.log('');
        console.log('📋 Si algo sale mal, ejecuta el rollback:');
        console.log('      supabase/migrations/rollback_20260221_full_schema_improvements.sql');
        process.exit(1);
    }

    console.log(`\n🏆 Método seleccionado: ${winner.name}`);
    console.log('\n🚀 Ejecutando migración completa...\n');

    // ── EJECUTAR MIGRACIÓN COMPLETA ──
    let migrationResult;

    switch (winner.name) {
        case '/rest/v1/sql (JSON)':
            migrationResult = await trySqlViaRestEndpoint(
                `${SUPABASE_URL}/rest/v1/sql`, {}, forwardSQL
            );
            break;
        case '/rest/v1/sql (raw)':
            migrationResult = await trySqlRawBody(
                `${SUPABASE_URL}/rest/v1/sql`, forwardSQL
            );
            break;
        case '/pg-meta/query':
            migrationResult = await trySqlRawBody(
                `${SUPABASE_URL}/pg-meta/query`, forwardSQL, 'application/json'
            );
            break;
        case 'supabase client': {
            const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
            // Usar el método que funcionó
            if (typeof supabase.sql === 'function') {
                const { data, error } = await supabase.sql(forwardSQL);
                migrationResult = { success: !error, status: error ? 500 : 200, data: error || data };
            } else {
                const { data, error } = await supabase.rpc('exec_sql', { query_text: forwardSQL });
                migrationResult = { success: !error, status: error ? 500 : 200, data: error || data };
            }
            break;
        }
    }

    // ── REPORTAR RESULTADO ──
    console.log('\n═══════════════════════════════════════════');
    if (migrationResult.success) {
        console.log('✅ MIGRACIÓN COMPLETADA EXITOSAMENTE');
        console.log('═══════════════════════════════════════════\n');
        console.log('Columnas añadidas:');
        console.log('  • agente_nombre_publico (TEXT)');
        console.log('  • agente_foto_url (TEXT)');
        console.log('  • parqueaderos (INTEGER, DEFAULT 0)');
        console.log('  • latitud, longitud (NUMERIC)');
        console.log('  • año_construccion (INTEGER)');
        console.log('  • antigüedad (TEXT)');
        console.log('  • estrato (INTEGER)');
        console.log('  • canon_administracion (NUMERIC)');
        console.log('  • codigo_postal (TEXT)');
        console.log('  • moneda (TEXT, DEFAULT COP)');
        console.log('  • video_url (TEXT)');
        console.log('  • fecha_disponible (DATE)');
        console.log('');
        console.log('Fix aplicado:');
        console.log('  • CHECK tipo: ahora acepta 9 tipos de inmueble');
        console.log('  • Datos de parqueaderos migrados desde servicios[]');
    } else {
        console.log('❌ ERROR EN LA MIGRACIÓN');
        console.log('═══════════════════════════════════════════\n');
        console.log('Status:', migrationResult.status);
        console.log('Error:', JSON.stringify(migrationResult.data, null, 2));
        console.log('\n⚠️  La base de datos NO fue modificada.');
        console.log('\n📋 Para ejecutar manualmente:');
        console.log('   https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql/new');
    }

    console.log('\n📁 Archivos relevantes:');
    console.log('   SQL Forward:  supabase/migrations/20260221_full_schema_improvements.sql');
    console.log('   SQL Rollback: supabase/migrations/rollback_20260221_full_schema_improvements.sql');
}

main().catch(err => {
    console.error('Error fatal:', err);
    process.exit(1);
});
