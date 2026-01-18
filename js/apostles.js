// js/apostles.js
document.addEventListener('DOMContentLoaded', async () => {
  await fetchData();
  renderChronological();
  renderSuccession();

  const chronoTab = document.getElementById('chrono-tab');
  const successionTab = document.getElementById('succession-tab');
  const chronoGrid = document.getElementById('apostles-grid');
  const successionView = document.getElementById('succession-view');

  chronoTab.addEventListener('click', () => {
    chronoTab.classList.add('active');
    successionTab.classList.remove('active');
    chronoGrid.style.display = 'grid';
    successionView.style.display = 'none';
  });

  successionTab.addEventListener('click', () => {
    successionTab.classList.add('active');
    chronoTab.classList.remove('active');
    chronoGrid.style.display = 'none';
    successionView.style.display = 'flex';
  });
});

// Helper: Get the preferred row(s) for an apostle (InSeason "1" > "0")
function getPreferredApostleData(apostleName) {
  const rows = allData.filter(r => r.ApostleName === apostleName);

  // Prefer InSeason="1"
  let preferred = rows.filter(r => r.InSeason === "1");
  if (preferred.length === 0) {
    // Fall back to "0"
    preferred = rows.filter(r => r.InSeason === "0");
  }
  // If still none, use any (placeholder)
  if (preferred.length === 0) {
    preferred = rows;
  }

  // Take the one with highest SeasonNumber if multiple (rare)
  preferred.sort((a, b) => Number(b.SeasonNumber) - Number(a.SeasonNumber));
  return preferred[0] || {};
}

// Helper: Count stories from preferred set only
function getStoryCount(apostleName) {
  const profile = getPreferredApostleData(apostleName);
  const preferredInSeason = profile.InSeason || "";

  return allData.filter(r =>
    r.ApostleName === apostleName &&
    r.StoryDate && r.StoryDate.trim() !== "" &&
    r.InSeason === preferredInSeason
  ).length;
}

function renderChronological() {
  const grid = document.getElementById('apostles-grid');
  grid.innerHTML = '';

  // Get unique apostles
  const apostleNames = [...new Set(allData.map(r => r.ApostleName).filter(Boolean))];
  const apostles = apostleNames.map(name => {
    const profile = getPreferredApostleData(name);
    return {
      name,
      number: profile.ApostleNumber || '?',
      profile
    };
  }).sort((a, b) => Number(a.number) - Number(b.number));

  apostles.forEach(ap => {
    const storyCount = getStoryCount(ap.name);
    const isPlaceholder = storyCount === 0;

    const card = document.createElement('a');
    card.href = isPlaceholder ? '#' : `apostle.html?apostle=${encodeURIComponent(ap.name)}`;
    card.className = `card ${isPlaceholder ? 'inactive' : ''}`;

    const bg = document.createElement('div');
    bg.className = 'card-bg';
    const url = ap.profile.ApostlePortraitURL?.trim() || 'img/placeholder.jpg';
    bg.style.backgroundImage = `url(${url})`;

    const overlay = document.createElement('div');
    overlay.className = 'card-overlay';
    overlay.innerHTML = `
      <h3>${ap.name} (#${ap.number})</h3>
      <p style="font-size: 1.3rem; margin: 0.8rem 0;">
        ${isPlaceholder ? 'No Stories Yet' : `${storyCount} ${storyCount === 1 ? 'story' : 'stories'}`}
      </p>
      <p>Born: ${ap.profile.BirthDate || '—'} | Called: ${ap.profile.CallDate || '—'}<br>Died: ${ap.profile.DeathDate || 'Living'}</p>
    `;

    card.append(bg, overlay);
    grid.appendChild(card);
  });
}

function renderSuccession() {
  const view = document.getElementById('succession-view');
  view.innerHTML = '';

  // Group by SeasonNumber
  const seasonsMap = new Map();
  allData.forEach(row => {
    const season = row.SeasonNumber?.trim();
    if (!season) return;
    if (!seasonsMap.has(season)) seasonsMap.set(season, new Map());

    const name = row.ApostleName;
    const apostleMap = seasonsMap.get(season);
    if (name && !apostleMap.has(name)) {
      apostleMap.set(name, row);  // Keep first occurrence (or we can merge later if needed)
    }
  });

  const sortedSeasons = [...seasonsMap.keys()].sort((a, b) => Number(a) - Number(b));

  sortedSeasons.forEach(season => {
    const apostleMap = seasonsMap.get(season);
    const apostles = [...apostleMap.values()].sort((a, b) => Number(a.ApostleNumber) - Number(b.ApostleNumber));

    const column = document.createElement('div');
    column.className = 'season-column';

    const header = document.createElement('h2');
    header.className = 'season-header';
    header.textContent = `Season ${season}`;
    column.appendChild(header);

    apostles.forEach(row => {
      const name = row.ApostleName;
      const storyCount = getStoryCount(name);
      const isPlaceholder = storyCount === 0;
      const profile = getPreferredApostleData(name);

      const card = document.createElement('a');
      card.href = isPlaceholder ? '#' : `apostle.html?apostle=${encodeURIComponent(name)}`;
      card.className = `card small ${isPlaceholder ? 'inactive' : ''}`;

      const bg = document.createElement('div');
      bg.className = 'card-bg';
      const url = profile.ApostlePortraitURL?.trim() || row.ApostlePortraitURL?.trim() || 'img/placeholder.jpg';
      bg.style.backgroundImage = `url(${url})`;

      const overlay = document.createElement('div');
      overlay.className = 'card-overlay';
      overlay.innerHTML = `
        <h3>${name} (#${row.ApostleNumber || '?'})</h3>
        <p>${isPlaceholder ? 'No Stories Yet' : `${storyCount} stories`}</p>
      `;

      card.append(bg, overlay);
      column.appendChild(card);
    });

    view.appendChild(column);
  });
}