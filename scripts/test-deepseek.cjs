const https = require('https');

const KEY = "KEY_REVOCADA_DEEPSEEK";
const BASE = "https://api.deepseek.com/v1";
const MODEL = "deepseek-chat";

const body = JSON.stringify({
    model: MODEL,
    messages: [
        { role: "system", content: "Eres un agente inmobiliario. Responde SOLO con un JSON válido: {\"titulo\":\"...\",\"tipo\":\"...\",\"precio\":123}" },
        { role: "user", content: "Apartamento en Caobos Cucuta, 120m2, 3 habitaciones, 2 baños, piscina. Precio 280 millones COP." }
    ],
    temperature: 0.3,
    max_tokens: 500,
});

const url = new URL(BASE + "/chat/completions");
const req = https.request({
    hostname: url.hostname, path: url.pathname, method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${KEY}` }
}, res => {
    let d = ''; res.on('data', c => d += c);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        const j = JSON.parse(d);
        if (j.choices) {
            console.log('✅ SUCCESS!');
            console.log('Generated:', j.choices[0].message.content.slice(0, 500));
            console.log('Model:', j.model);
        } else {
            console.log('Response:', d.slice(0, 400));
        }
    });
});
req.on('error', e => console.error('Error:', e.message));
req.write(body); req.end();
