// js/data.js - STATIC LOCAL CSV VERSION (fully self-contained)
const CSV_URL = './data/database.csv';  // Local file in repo – no external dependencies!

let allData = [];

function parseCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;  // Skip blanks

    let fields = [];
    let field = '';
    let inQuotes = false;

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      const nextChar = line[j + 1];

      if (char === '"' && nextChar === '"') {
        field += '"';
        j++;
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(field.trim());
        field = '';
      } else {
        field += char;
      }
    }
    fields.push(field.trim());  // Last field

    // Clean quotes
    fields = fields.map(f => f.replace(/^"|"$/g, '').replace(/""/g, '"'));

    if (fields.length === headers.length) {
      const obj = {};
      headers.forEach((h, idx) => obj[h] = fields[idx] || '');
      data.push(obj);
    }
  }
  return data;
}

async function fetchData() {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error('CSV not found');
    const csvText = await response.text();
    allData = parseCSV(csvText);
    console.log(`Loaded ${allData.length} stories from static database.csv`);
    return allData;  // <-- ADD THIS LINE
  } catch (e) {
    console.error('CSV load failed:', e);
    document.body.innerHTML += '<p style="text-align:center;color:red;">Failed to load data. Check console.</p>';
    return [];  // <-- OPTIONAL: Graceful empty return
  }
}
