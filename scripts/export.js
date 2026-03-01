// scripts/export.js
const axios = require('axios');
const fs = require('fs').promises;  // promise-based for cleaner async

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQfZPsL8RZmrhJyMbXHCwT7C74Aad0euECIZI2qosIWmMaP7VB3AXBqtWrnPqpL7he2ZVKs5H8YYqDe/pub?gid=760488340&single=true&output=csv';

const OUTPUT_PATH = './data/database.csv';

async function downloadCSV() {
  try {
    const response = await axios.get(CSV_URL, {
      responseType: 'text',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    const csvText = response.data;

    // Write to file
    await fs.writeFile(OUTPUT_PATH, csvText, 'utf8');

    // Quick stats
    const lines = csvText.trim().split('\n');
    const rowCount = lines.length - 1;  // subtract header

    console.log(`✅ Successfully exported ${rowCount} rows to ${OUTPUT_PATH}`);
    console.log('First few lines (preview):');
    console.log(lines.slice(0, 5).join('\n'));

  } catch (error) {
    console.error('Download failed:');
    console.error(error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response snippet:', error.response.data.substring(0, 300));
    }
  }
}

downloadCSV();