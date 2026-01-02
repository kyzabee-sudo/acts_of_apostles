// scripts/export-json.js - NO NPM DEPENDENCIES VERSION
const https = require('https');
const fs = require('fs');
const path = require('path');

// Your published CSV URL (from File > Share > Publish to web > Database tab > Comma-separated values)
const CSV_URL = 'https://docs.google.com/spreadsheets/d/1bNPhgm3uwp84rB6YxmtrRR3_OCgB4zEFMo-X0aWq_J4/export?format=csv&gid=760488340';

async function exportData() {
  console.log('Fetching CSV from Google Sheet...');

  https.get(CSV_URL, (res) => {
    let csvData = '';
    res.on('data', chunk => csvData += chunk);
    res.on('end', () => {
      try {
        // Parse CSV manually (simple and fast for your structure)
        const lines = csvData.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
        
        const jsonData = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, '').replace(/""/g, '"'));
          let obj = {};
          headers.forEach((header, i) => {
            obj[header] = values[i] || '';
          });
          return obj;
        });

        // Write to data/apostles.json
        const jsonPath = path.join(__dirname, '../data/apostles.json');
        fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
        fs.writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2));

        console.log(`✅ Success! Exported ${jsonData.length} rows to data/apostles.json`);
        console.log('   Next:');
        console.log('   git add data/apostles.json');
        console.log('   git commit -m "Update data: new stories"');
        console.log('   git push');
        console.log('   → Site updates automatically on GitHub Pages!');
      } catch (error) {
        console.error('❌ Parsing failed:', error.message);
      }
    });
  }).on('error', (error) => {
    console.error('❌ Fetch failed:', error.message);
  });
}

exportData();