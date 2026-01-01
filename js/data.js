// js/data.js
const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQfZPsL8RZmrhJyMbXHCwT7C74Aad0euECIZI2qosIWmMaP7VB3AXBqtWrnPqpL7he2ZVKs5H8YYqDe/pub?gid=760488340&single=true&output=csv'; // <-- PASTE YOUR PUBLISHED CSV LINK HERE

let allData = [];

// Parse CSV (PapaParse lite version - no external lib needed)
async function fetchData() {
  const response = await fetch(CSV_URL);
  const text = await response.text();
  const rows = text.trim().split('\n').map(row => row.split(',').map(cell => cell.trim().replace(/^"|"$/g, '').replace(/""/g, '"')));
  const headers = rows[0];
  allData = rows.slice(1).map(row => {
    let obj = {};
    headers.forEach((h, i) => obj[h] = row[i] || '');
    return obj;
  });
  return allData;
}

// Dynamic first image from ThreadReader (cached 7 days)
async function getFirstImage(threadUrl, fallbackPortrait) {
  if (!threadUrl) return fallbackPortrait || 'img/placeholder.jpg';

  const cacheKey = `img_${btoa(threadUrl)}`;
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    const data = JSON.parse(cached);
    if (data.expiry > Date.now()) return data.url;
  }

  try {
    const proxy = `https://api.allorigins.win/raw?url=${encodeURIComponent(threadUrl)}`;
    const res = await fetch(proxy);
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const img = doc.querySelector('#thread img[src*="pbs.twimg.com/media"]') ||
                doc.querySelector('#thread img:not([class*="avatar"])');
    const url = img?.src || fallbackPortrait || 'img/placeholder.jpg';

    localStorage.setItem(cacheKey, JSON.stringify({ url, expiry: Date.now() + 7*24*60*60*1000 }));
    return url;
  } catch (e) {
    console.warn('Image fetch failed:', threadUrl);
    return fallbackPortrait || 'img/placeholder.jpg';
  }
}