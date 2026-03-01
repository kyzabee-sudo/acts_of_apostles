// scripts/export.js

import axios from 'axios';
import { promises as fs } from 'fs';   // or import fs from 'fs/promises';

const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQfZPsL8RZmrhJyMbXHCwT7C74Aad0euECIZI2qosIWmMaP7VB3AXBqtWrnPqpL7he2ZVKs5H8YYqDe/pub?gid=760488340&single=true&output=csv';
const OUTPUT_PATH = './data/database.csv';

async function downloadCSV() {
  try {
    const response = await axios.get(CSV_URL, {
      responseType: 'text',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    const csvText = response.data;
    await fs.writeFile(OUTPUT_PATH, csvText, 'utf8');

    const lines = csvText.trim().split('\n');
    const rowCount = lines.length - 1;

    console.log(`✅ Exported ${rowCount} rows to ${OUTPUT_PATH}`);
    console.log('Preview (first 3 lines):');
    console.log(lines.slice(0, 3).join('\n'));

  } catch (error) {
    console.error('Download failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Snippet:', error.response.data?.substring?.(0, 300));
    }
  }
}

downloadCSV();