#!/usr/bin/env node

const https = require('https');
const fs = require('fs');
const path = require('path');

// Google Sheets CSV export URL
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQfZPsL8RZmrhJyMbXHCwT7C74Aad0euECIZI2qosIWmMaP7VB3AXBqtWrnPqpL7he2ZVKs5H8YYqDe/pub?gid=760488340&single=true&output=csv';

// Path to save the CSV
const outputPath = path.join(__dirname, '../data/database.csv');

console.log('Fetching database from Google Sheets...');

https.get(CSV_URL, (response) => {
  // Check for redirect
  if (response.statusCode === 301 || response.statusCode === 302) {
    console.log('Following redirect...');
    return https.get(response.headers.location, handleResponse);
  }

  handleResponse(response);
}).on('error', (error) => {
  console.error('Error fetching data:', error.message);
  process.exit(1);
});

function handleResponse(response) {
  if (response.statusCode !== 200) {
    console.error(`Failed to fetch. Status code: ${response.statusCode}`);
    process.exit(1);
  }

  const file = fs.createWriteStream(outputPath);
  let dataSize = 0;

  response.on('data', (chunk) => {
    dataSize += chunk.length;
  });

  response.pipe(file);

  file.on('finish', () => {
    file.close();
    console.log(`✓ Database updated successfully!`);
    console.log(`✓ Saved to: ${outputPath}`);
    console.log(`✓ File size: ${(dataSize / 1024).toFixed(2)} KB`);
  });

  file.on('error', (error) => {
    fs.unlink(outputPath, () => {}); // Delete the file if error
    console.error('Error writing file:', error.message);
    process.exit(1);
  });
}
