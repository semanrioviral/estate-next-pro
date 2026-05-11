const sharp = require('sharp');
const path = require('path');

const svg = `<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0f172a" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)" />
  <rect x="0" y="0" width="1200" height="6" fill="#ea580c" />
  <rect x="0" y="624" width="1200" height="6" fill="#ea580c" />
  <text x="600" y="260" font-family="Arial, sans-serif" font-size="52" font-weight="bold" fill="#ffffff" text-anchor="middle" letter-spacing="2">
    INMOBILIARIA TUCASA
  </text>
  <text x="600" y="330" font-family="Arial, sans-serif" font-size="28" fill="#ea580c" text-anchor="middle" letter-spacing="4" font-weight="600">
    LOS PATIOS
  </text>
  <line x1="400" y1="370" x2="800" y2="370" stroke="#475569" stroke-width="1" />
  <text x="600" y="420" font-family="Arial, sans-serif" font-size="22" fill="#94a3b8" text-anchor="middle" letter-spacing="1">
    Lider en Finca Raiz - Norte de Santander
  </text>
  <text x="600" y="570" font-family="Arial, sans-serif" font-size="14" fill="#64748b" text-anchor="middle">
    tucasalospatios.com
  </text>
</svg>`;

const outputPath = path.join(__dirname, '..', 'public', 'og-default.jpg');

sharp(Buffer.from(svg))
  .resize(1200, 630)
  .jpeg({ quality: 90 })
  .toFile(outputPath)
  .then(info => {
    console.log(`og-default.jpg created: ${info.width}x${info.height}, ${(info.size / 1024).toFixed(1)}KB`);
    console.log(`Saved to: ${outputPath}`);
  })
  .catch(err => {
    console.error('Error:', err.message);
    process.exit(1);
  });
