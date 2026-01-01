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
  // Use the highest SeasonNumber for this apostle (already selected in 'ap')
  const currentSeason = Number(ap.SeasonNumber);

  // Count ONLY stories from the highest season
  const storyCount = allData.filter(row => 
    row.ApostleName === ap.ApostleName && 
    row.StoryDate && 
    Number(row.SeasonNumber) === currentSeason
  ).length;

  const card = document.createElement('a');
  card.href = `apostle.html?apostle=${encodeURIComponent(ap.ApostleName)}`;
  card.className = 'card';

  const bg = document.createElement('div');
  bg.className = 'card-bg';
  const portraitUrl = ap.ApostlePortraitURL.trim() || 'img/placeholder.jpg';
  bg.style.backgroundImage = `url(${portraitUrl})`;

  const overlay = document.createElement('div');
  overlay.className = 'card-overlay';
  overlay.innerHTML = `
    <h3>${ap.ApostleName} (#${ap.ApostleNumber})</h3>
    <p style="font-size: 1.3rem; margin: 0.8rem 0; opacity: 0.95;">
      ${storyCount} ${storyCount === 1 ? 'story' : 'stories'}
    </p>
    <p>Born: ${ap.BirthDate} | Called: ${ap.CallDate}<br>Died: ${ap.DeathDate || 'Living'}</p>
  `;

  card.append(bg, overlay);
  grid.appendChild(card);
});
}