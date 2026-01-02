// scripts/export-json.js - USING YOUR CONFIRMED PUBLIC CSV LINK
const https = require('https');
const fs = require('fs');
const path = require('path');

// Your confirmed public CSV link (full Database tab ~664 rows)
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQfZPsL8RZmrhJyMbXHCwT7C74Aad0euECIZI2qosIWmMaP7VB3AXBqtWrnPqpL7he2ZVKs5H8YYqDe/pub?gid=760488340&single=true&output=csv';

function parseCSVRobust(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error('Empty CSV');

  let headers = [];
  let data = [];

  lines.forEach((line, lineIdx) => {
    if (line.trim() === '' || line.startsWith('---')) return;  // Skip blanks/separators

    let fields = [];
    let field = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];

      if (char === '"' && nextChar === '"') {
        field += '"';
        i++;  // Skip escaped quote
      } else if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(field);
        field = '';
      } else {
        field += char;
      }
    }
    fields.push(field);  // Last field

    // Clean quotes from all fields
    fields = fields.map(f => f.replace(/^"|"$/g, '').replace(/""/g, '"').trim());

    if (lineIdx === 0) {
      headers = fields;
      console.log(`Headers (${headers.length}): ${headers.join(', ')}`);
    } else if (fields.length === headers.length) {
      const obj = {};
      headers.forEach((h, idx) => obj[h] = fields[idx] || '');
      data.push(obj);
    }
  });

  return data;
}

https.get(CSV_URL, (res) => {
  let csvData = '';
  res.on('data', chunk => csvData += chunk);
  res.on('end', () => {
    try {
      const jsonData = parseCSVRobust(csvData);
      const jsonPath = path.join(__dirname, '../data/apostles.json');
      fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
      fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));
      console.log(`✅ Success! Exported ${jsonData.length} rows (expect ~664) to data/apostles.json`);
      console.log('Next: git add data/apostles.json && git commit -m "Full Database export" && git push');
    } catch (error) {
      console.error('❌ Failed:', error.message);
    }
  });
}).on('error', (err) => console.error('❌ Network error:', err.message));