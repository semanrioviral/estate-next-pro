const https = require('https');

const SUPABASE_URL = 'uehajzlrvqvirtsubsdq.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || (() => { throw new Error('SUPABASE_SERVICE_ROLE_KEY no configurada'); })();

const PROPERTY_ID = '152ca562-9a49-464a-8f23-eff935f12b9a';

// Unsplash real estate images
const images = [
  { url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80", orden: 0, es_principal: true },
  { url: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80", orden: 1, es_principal: false },
  { url: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80", orden: 2, es_principal: false },
  { url: "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&q=80", orden: 3, es_principal: false },
  { url: "https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80", orden: 4, es_principal: false },
  { url: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&q=80", orden: 5, es_principal: false },
  { url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&q=80", orden: 6, es_principal: false },
  { url: "https://images.unsplash.com/photo-1560185007-5f0bb1866cab?w=800&q=80", orden: 7, es_principal: false },
];

const body = JSON.stringify(images.map(img => ({ ...img, property_id: PROPERTY_ID })));

const options = {
  hostname: SUPABASE_URL,
  path: '/rest/v1/property_images',
  method: 'POST',
  headers: {
    'apikey': SERVICE_KEY,
    'Authorization': `Bearer ${SERVICE_KEY}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    try {
      const json = JSON.parse(data);
      console.log(`✅ ${json.length} images inserted for property ${PROPERTY_ID}`);
      console.log('Slug: apartamento-moderno-caobos-cucuta-3-habitaciones');
      console.log('\n🌐 View at:');
      console.log('  Admin: http://localhost:3000/admin/propiedades/editar/' + PROPERTY_ID);
      console.log('  Public: http://localhost:3000/propiedades/apartamento-moderno-caobos-cucuta-3-habitaciones');
    } catch(e) {
      console.log('Error parsing:', data);
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(body);
req.end();
