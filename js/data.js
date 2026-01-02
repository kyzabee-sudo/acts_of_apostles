// js/data.js - STATIC JSON VERSION
const JSON_URL = './data/apostles.json';  // Loads from your repo – instant & unlimited!

let allData = [];

async function fetchData() {
  try {
    const response = await fetch(JSON_URL);
    allData = await response.json();
    console.log(`Loaded ${allData.length} stories from static JSON`);
    return allData;
  } catch (e) {
    console.error('Data load failed:', e);
    document.body.innerHTML += '<p style="text-align:center;color:red;">Failed to load data. Please refresh or check connection.</p>';
  }
}

// getFirstImage remains the same (can simplify proxy if needed later)
async function getFirstImage(threadUrl, fallbackPortrait) {
  // ... (keep your existing function – it still works great)
}