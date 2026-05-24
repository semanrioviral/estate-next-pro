const https = require('https');
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaGFqemxydnF2aXJ0c3Vic2RxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDkzOTU5MiwiZXhwIjoyMDg2NTE1NTkyfQ.Nu-MXHv32NU7fPvtqfzC7QZ0IZ4Q48RJF0r7_kOaEPI';

const sqls = [
    "ALTER TABLE leads ADD COLUMN IF NOT EXISTS fuente TEXT",
    "ALTER TABLE leads ADD COLUMN IF NOT EXISTS notas TEXT",
    "ALTER TABLE leads ADD COLUMN IF NOT EXISTS ultimo_contacto TIMESTAMPTZ",
    "ALTER TABLE leads ADD COLUMN IF NOT EXISTS agente_id UUID REFERENCES profiles(id)",
];

async function run(sql) {
    return new Promise((resolve) => {
        const body = JSON.stringify({ query: sql });
        const req = https.request({
            hostname: 'uehajzlrvqvirtsubsdq.supabase.co',
            path: '/rest/v1/rpc/',
            method: 'POST',
            headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, 'Content-Type': 'application/json' }
        }, res => {
            let d = '';
            res.on('data', c => d += c);
            res.on('end', () => resolve({ status: res.statusCode, body: d.slice(0, 300) }));
        });
        req.on('error', e => resolve({ error: e.message }));
        req.write(body);
        req.end();
    });
}

(async () => {
    for (const sql of sqls) {
        const r = await run(sql);
        console.log(r.status, r.error || r.body);
    }
    console.log('Done.');
})();
