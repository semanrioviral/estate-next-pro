const https = require('https');

const KEY = "KEY_REVOCADA_OPENROUTER";
const MODEL = "gpt-4o-mini";

const URLS = [
    "https://openrouter.ai/api/v1",
    "https://api.opencode.ai/v1",
    "https://api.opencodes.ai/v1",
];

async function test(url) {
    return new Promise(resolve => {
        const body = JSON.stringify({ model: MODEL, messages: [{ role: "user", content: "Say 'hello'" }], max_tokens: 10 });
        const u = new URL(url + "/chat/completions");
        const req = https.request({ hostname: u.hostname, path: u.pathname, method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEY}` } }, res => {
            let d = ''; res.on('data', c => d += c); res.on('end', () => resolve({ url, status: res.statusCode, body: d.slice(0, 200) }));
        });
        req.on('error', e => resolve({ url, error: e.message }));
        req.write(body); req.end();
    });
}

(async () => {
    for (const url of URLS) {
        const r = await test(url);
        console.log(r.status, url, r.error || r.body.slice(0, 120));
    }
})();
