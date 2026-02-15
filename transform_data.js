const fs = require('fs');

// Helper to parse CSV respecting quotes
function parseCSV(content) {
    const lines = [];
    let currentRow = [];
    let currentCell = '';
    let inQuotes = false;

    for (let i = 0; i < content.length; i++) {
        const char = content[i];
        const nextChar = content[i + 1];

        if (char === '"' && inQuotes && nextChar === '"') {
            currentCell += '"';
            i++;
        } else if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            currentRow.push(currentCell);
            currentCell = '';
        } else if ((char === '\r' || char === '\n') && !inQuotes) {
            if (currentCell || currentRow.length > 0) {
                currentRow.push(currentCell);
                // Handle potential empty lines or carriage returns
                if (currentRow.length > 1 || currentRow[0] !== '') {
                    lines.push(currentRow);
                }
                currentRow = [];
                currentCell = '';
            }
            if (char === '\r' && nextChar === '\n') i++;
        } else {
            currentCell += char;
        }
    }
    if (currentCell || currentRow.length > 0) {
        currentRow.push(currentCell);
        lines.push(currentRow);
    }
    return lines;
}

function cleanHTML(html) {
    if (!html) return '';
    // Remove comments
    let text = html.replace(/<!--[\s\S]*?-->/g, '');
    // Remove tags but keep logical spacing
    text = text.replace(/<\/p>/g, '\n\n')
        .replace(/<br\s*\/?>/g, '\n')
        .replace(/<\/li>/g, '\n')
        .replace(/<[^>]+>/g, '');
    // Decode entities
    text = text.replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>');
    // Clean whitespace
    return text.split('\n').map(l => l.trim()).filter(l => l).join('\n');
}

function extractPrice(text) {
    // Look for patterns like "$ 310.000.000", "310 millones", "$310 millones"
    if (!text) return 0;

    const millonesMatch = text.match(/(\d+)[.,]?(\d+)?\s*millones/i);
    if (millonesMatch) {
        const num = parseFloat(millonesMatch[1] + (millonesMatch[2] ? '.' + millonesMatch[2] : ''));
        return num * 1000000;
    }

    const numericMatch = text.match(/\$\s*([\d.,]+)/);
    if (numericMatch) {
        return parseInt(numericMatch[1].replace(/[.,]/g, ''));
    }

    return 0;
}

function extractBarrio(text, address) {
    // Try to find "Barrio X" in text
    const barrioMatch = text.match(/Barrio\s+([A-ZÁÉÍÓÚñÑ0-9\s]+?)(,|\.|en\s|–|-)/i);
    if (barrioMatch) return barrioMatch[1].trim();

    // Check address
    if (address && address.toUpperCase().includes('BARRIO')) {
        const addrMatch = address.match(/BARRIO\s+([A-ZÁÉÍÓÚñÑ0-9\s]+?)(,|$)/i);
        if (addrMatch) return addrMatch[1].trim();
    }

    return 'Los Patios'; // Default
}

try {
    const rawContent = fs.readFileSync('import_data.csv', 'utf8');
    // Remove BOM if present
    const content = rawContent.charCodeAt(0) === 0xFEFF ? rawContent.slice(1) : rawContent;

    const rows = parseCSV(content);
    if (rows.length < 2) throw new Error('CSV empty or invalid');

    const headers = rows[0];
    const dataRows = rows.slice(1);

    const propertiesMap = new Map();
    const errors = [];
    let processedCount = 0;
    let skippedCount = 0;

    // Helper to get value by header name
    const getVal = (row, headerName) => {
        const idx = headers.indexOf(headerName);
        return idx !== -1 ? row[idx] : null;
    };

    dataRows.forEach((row, index) => {
        try {
            const slug = getVal(row, 'Slug');
            if (!slug) {
                skippedCount++;
                return;
            }

            // Since we might have multiple rows per property (though inspection suggested otherwise for images),
            // let's assume one row per property based on Image URL pipes. 
            // If duplicate slugs exist, we skip or merge. For now, skip if exists (simpler duplication check).
            if (propertiesMap.has(slug)) {
                return;
            }

            const title = getVal(row, 'Title') || '';
            const rawContent = getVal(row, 'Content') || '';
            const cleanedDescription = cleanHTML(rawContent);
            const address = getVal(row, 'es_property_address') || '';

            // Handle Price
            let price = 0;
            const priceCol = getVal(row, 'es_property_price');
            const idCol = getVal(row, 'id');

            // If price column looks like ID (equality check loosely)
            if (priceCol == idCol) {
                // Try extract from description or title
                price = extractPrice(cleanedDescription) || extractPrice(title) || 0;
            } else {
                price = parseInt(priceCol) || 0;
            }

            // Handle Barrio/City
            let barrio = getVal(row, 'es_property_state');
            // If numeric, try extract
            if (!barrio || !isNaN(parseInt(barrio))) {
                barrio = extractBarrio(title, address) || extractBarrio(cleanedDescription, address);
            }

            let ciudad = getVal(row, 'es_property_city');
            if (!ciudad || !isNaN(parseInt(ciudad))) {
                if (address.toLowerCase().includes('cúcuta')) ciudad = 'Cúcuta';
                else if (address.toLowerCase().includes('villa del rosario')) ciudad = 'Villa del Rosario';
                else ciudad = 'Los Patios';
            }

            // Handle Images
            const rawImages = getVal(row, 'Image URL') || '';
            const images = rawImages.split('|').filter(url => url.trim().length > 0);

            const property = {
                slug: slug.trim(),
                titulo: title.trim(),
                descripcion: cleanedDescription,
                descripcion_corta: getVal(row, 'es_property_alternative_description') || cleanedDescription.substring(0, 150) + '...',
                precio: price,
                habitaciones: parseInt(getVal(row, 'es_property_total_rooms')) || 0,
                baños: parseInt(getVal(row, 'es_property_bathrooms')) || 0, // Column 25 in inspection
                area_m2: parseInt(getVal(row, 'es_property_lot_size')) || 0,
                direccion: address.trim(),
                ciudad: ciudad,
                barrio: barrio,
                imagen_principal: images[0] || '',
                imagenes: images, // BulkImporter expects 'imagenes' or 'galeria'? The schema uses 'galeria' in mapProperty but let's check BulkImporter. 
                // Wait, BulkImporter uses handleBulkImport which expects keys.
                // handleBulkImport: "servicios", "etiquetas", "galeria" isn't explicitly mapped in the item construction in Step 740!
                // Step 740: "imagen_principal: item.imagen_principal || ''".
                // IT DOES NOT MAP 'imagenes' or 'galeria' array to insertion logic for the additional images table!
                // Checking Step 740 again...
                // handleBulkImport logic:
                // It inserts into 'properties'. It DOES NOT seem to insert into 'property_images' inside handleBulkImport!
                // I need to fix handleBulkImport to handle galleries too.
                // For now, I will include 'galeria' in JSON.
                galeria: images,
                meta_titulo: getVal(row, '_yoast_wpseo_title') || title,
                meta_descripcion: getVal(row, '_yoast_wpseo_metadesc') || '',
                tipo: 'casa', // Default
                estado: 'Disponible',
                servicios: [],
                etiquetas: []
            };

            propertiesMap.set(slug, property);
            processedCount++;

        } catch (e) {
            errors.push(`Row ${index}: ${e.message}`);
        }
    });

    const result = Array.from(propertiesMap.values());

    console.log(`PROCESSED: ${processedCount}`);
    console.log(`ERRORS: ${errors.length}`);
    if (errors.length > 0) console.log('FIRST ERROR:', errors[0]);

    fs.writeFileSync('properties.json', JSON.stringify(result, null, 2));

} catch (err) {
    console.error('Fatal error:', err);
}
