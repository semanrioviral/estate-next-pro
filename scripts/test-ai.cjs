const https = require('https');

const API_KEY = process.env.OPENAI_API_KEY;
const BASE_URL = process.env.OPENAI_BASE_URL || "https://api.openai.com/v1";
const MODEL = process.env.AI_MODEL || "gpt-4o-mini";

const body = JSON.stringify({
    model: MODEL,
    messages: [
        { role: "system", content: "Eres un agente inmobiliario. Devuelve SOLO un JSON con: {titulo, tipo, operacion, precio, ciudad, barrio, habitaciones, banos, area_m2, descripcion}" },
        { role: "user", content: "Apartamento en Caobos Cucuta, 120m2, 3 habitaciones, 2 baños, piscina. Precio 280 millones." }
    ],
    temperature: 0.3,
    max_tokens: 500,
    response_format: { type: "json_object" }
});

const url = new URL(BASE_URL + "/chat/completions");
const options = {
    hostname: url.hostname,
    path: url.pathname,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
    }
};

console.log(`Testing: ${BASE_URL}/chat/completions`);
console.log(`Model: ${MODEL}`);
console.log(`Key: ${API_KEY.slice(0,15)}...`);

const req = https.request(options, res => {
    let data = '';
    res.on('data', c => data += c);
    res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${data.slice(0, 600)}`);
        try {
            const json = JSON.parse(data);
            if (json.choices) {
                console.log('\n✅ SUCCESS! Generated:');
                console.log(json.choices[0].message.content.slice(0, 400));
            }
        } catch {}
    });
});

req.on('error', e => console.error('NETWORK ERROR:', e.message));
req.write(body);
req.end();
