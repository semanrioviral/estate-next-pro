const https = require('https');

const SUPABASE_URL = 'uehajzlrvqvirtsubsdq.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVlaGFqemxydnF2aXJ0c3Vic2RxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDkzOTU5MiwiZXhwIjoyMDg2NTE1NTkyfQ.Nu-MXHv32NU7fPvtqfzC7QZ0IZ4Q48RJF0r7_kOaEPI';

const property = {
  titulo: "Apartamento Moderno en Caobos - 3 Habitaciones con Vista",
  descripcion: "Hermoso apartamento de 120m2 ubicado en el exclusivo barrio Caobos de Cucuta. Cuenta con 3 habitaciones amplias, 2 banos completos, sala-comedor integrada, cocina abierta con isla, zona de lavanderia y balcon con vista panoramica a la ciudad. El conjunto ofrece piscina, gimnasio, salon social, parqueadero privado y seguridad 24 horas.",
  descripcion_corta: "Apartamento moderno en Caobos. 120m2, 3 habitaciones, piscina y gimnasio.",
  ciudad: "Cucuta",
  barrio: "Caobos",
  direccion: "Av. 3E #14-65, Torre B, Apto 802",
  precio: 280000000,
  moneda: "COP",
  negociable: true,
  estado: "Disponible",
  operacion: "venta",
  tipo: "apartamento",
  habitaciones: 3,
  "baños": 2,
  parqueaderos: 1,
  area_m2: 120,
  tipo_uso: "Residencial",
  año_construccion: 2023,
  antigüedad: "Nuevo",
  estrato: 5,
  canon_administracion: 380000,
  codigo_postal: "540001",
  financiamiento: "Acepta credito hipotecario y leasing habitacional",
  destacado: true,
  servicios: ["Piscina", "Gimnasio", "Salon social", "Seguridad 24h", "Parqueadero privado", "Ascensor", "Zona BBQ"],
  etiquetas: ["Entrega Inmediata", "Estreno", "Negociable"],
  imagen_principal: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80",
  slug: "apartamento-moderno-caobos-cucuta-3-habitaciones",
  meta_titulo: "Apartamento en Venta en Caobos, Cucuta - 3 Habitaciones | Tucasa Los Patios",
  meta_descripcion: "Apartamento moderno de 120m2 en Caobos, Cucuta. 3 habitaciones, piscina, gimnasio, seguridad 24h.",
  canonical: "https://tucasalospatios.com/propiedades/apartamento-moderno-caobos-cucuta-3-habitaciones"
};

const body = JSON.stringify(property);

const options = {
  hostname: SUPABASE_URL,
  path: '/rest/v1/properties',
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
      console.log('Response:', JSON.stringify(json, null, 2));
      if (json.id) {
        console.log('\n✅ Property created! ID:', json.id);
        console.log('Slug:', json.slug);
      }
    } catch(e) {
      console.log('Raw:', data);
    }
  });
});

req.on('error', (e) => console.error('Error:', e.message));
req.write(body);
req.end();
