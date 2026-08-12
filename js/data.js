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

    const fields = [];
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

    if (fields.length === headers.length) {
      const obj = {};
      headers.forEach((h, idx) => obj[h] = fields[idx] || '');
      data.push(obj);
    }
  }
  return data;
}

function inSeasonValue(value) {
  return String(value ?? '').trim();
}

// Prefer InSeason "1", then "0", then any remaining row (placeholders).
function getPreferredApostleData(apostleName) {
  const rows = allData.filter(r => r.ApostleName === apostleName);
  if (rows.length === 0) return null;

  let preferred = rows.filter(r => inSeasonValue(r.InSeason) === '1');
  if (preferred.length === 0) {
    preferred = rows.filter(r => inSeasonValue(r.InSeason) === '0');
  }
  if (preferred.length === 0) {
    preferred = rows;
  }

  preferred.sort((a, b) => Number(b.SeasonNumber) - Number(a.SeasonNumber));
  return preferred[0];
}

function getStoriesForApostle(apostleName) {
  const profile = getPreferredApostleData(apostleName);
  if (!profile) return [];

  const preferredInSeason = inSeasonValue(profile.InSeason);
  return allData
    .filter(r =>
      r.ApostleName === apostleName &&
      r.StoryDate?.trim() &&
      inSeasonValue(r.InSeason) === preferredInSeason
    )
    .sort((a, b) => new Date(a.StoryDate) - new Date(b.StoryDate));
}

function getStoryCount(apostleName) {
  return getStoriesForApostle(apostleName).length;
}

function formatDeathLabel(deathDate) {
  const value = String(deathDate ?? '').trim();
  if (!value || value.toLowerCase() === 'living') {
    return 'Living';
  }
  return `Died: ${value}`;
}

async function fetchData() {
  try {
    const response = await fetch(CSV_URL);
    if (!response.ok) throw new Error('CSV not found');
    const csvText = await response.text();
    allData = parseCSV(csvText);
    console.log(`Loaded ${allData.length} stories from static database.csv`);
    return allData;
  } catch (e) {
    console.error('CSV load failed:', e);
    document.body.innerHTML += '<p style="text-align:center;color:red;">Failed to load data. Check console.</p>';
    return [];
  }
}
