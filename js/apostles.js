// js/apostles.js
document.addEventListener('DOMContentLoaded', async () => {
  await fetchData();
  renderApostles();
});

function renderApostles() {
  const grid = document.getElementById('apostles-grid');
  grid.innerHTML = '';

  // Group and de-duplicate: highest SeasonNumber per apostle
  const apostleMap = new Map();
  allData.forEach(row => {
    const key = row.ApostleName;
    if (!apostleMap.has(key) || Number(row.SeasonNumber) > Number(apostleMap.get(key).SeasonNumber)) {
      apostleMap.set(key, row);
    }
  });

  const apostles = Array.from(apostleMap.values())
    .sort((a, b) => Number(a.ApostleNumber) - Number(b.ApostleNumber));

  apostles.forEach(ap => {
    const card = document.createElement('a');
    card.href = `apostle.html?apostle=${encodeURIComponent(ap.ApostleName)}`;
    card.className = 'card';

    const bg = document.createElement('div');
    bg.className = 'card-bg';
    bg.style.backgroundImage = `url(${ap.ApostlePortraitURL || 'img/placeholder.jpg'})`;

    const overlay = document.createElement('div');
    overlay.className = 'card-overlay';
    overlay.innerHTML = `
      <h3>${ap.ApostleName} (#${ap.ApostleNumber})</h3>
      <p>Born: ${ap.BirthDate} | Called: ${ap.CallDate}<br>Died: ${ap.DeathDate || 'Living'}</p>
      <p>Coverage: ${ap.CoverageStartDate} – ${ap.CoverageEndDate || 'ongoing'}</p>
    `;

    card.append(bg, overlay);
    grid.appendChild(card);
  });
}