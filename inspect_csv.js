const fs = require('fs');

function parseSimpleCSV(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
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
                lines.push(currentRow);
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

const data = parseSimpleCSV('import_data.csv');
const headers = data[0];

console.log('--- HEADERS WITH INDICES ---');
headers.forEach((h, i) => console.log(`${i}: ${h}`));

console.log('--- SAMPLE ROWS (Indices) ---');
for (let i = 1; i <= 5; i++) {
    const row = data[i];
    if (!row) continue;
    console.log(`\nROW ${i}:`);
    row.forEach((val, idx) => {
        const header = headers[idx] || `UNKNOWN_${idx}`;
        if (val.length > 50) val = val.substring(0, 47) + '...';
        console.log(`  [${idx}] ${header}: ${val}`);
    });
}
