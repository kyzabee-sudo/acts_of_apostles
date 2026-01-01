// js/stories.js
document.addEventListener('DOMContentLoaded', async () => {
  await fetchData();
  const params = new URLSearchParams(location.search);
  const name = params.get('apostle');
  if (!name) {
    document.body.innerHTML = '<p>No apostle selected.</p>';
    return;
  }
  renderStories(name);
});

async function renderStories(apostleName) {
  const headerName = document.getElementById('apostle-name');
  const headerDates = document.getElementById('apostle-dates');
  const grid = document.getElementById('stories-grid');
  grid.innerHTML = '';

  // Find highest-season profile data
  const profileRows = allData.filter(r => r.ApostleName === apostleName);
  const profile = profileRows.reduce((best, cur) => 
    Number(cur.SeasonNumber) > Number(best.SeasonNumber) ? cur : best
  );

  headerName.textContent = `${profile.ApostleName} (#${profile.ApostleNumber})`;
  headerDates.innerHTML = `Born: ${profile.BirthDate} | Called: ${profile.CallDate}<br>Died: ${profile.DeathDate || 'Living'}`;

  // All stories for this apostle, sorted by StoryDate
  const stories = allData
    .filter(r => r.ApostleName === apostleName && r.StoryDate)
    .sort((a, b) => new Date(a.StoryDate) - new Date(b.StoryDate));

  for (const story of stories) {
    const card = document.createElement('a');
    card.href = story.ThreadReaderURL || story.ThreadLink;
    card.target = '_blank';
    card.rel = 'noopener';
    card.className = 'card';

    const bg = document.createElement('div');
    bg.className = 'card-bg';
    const imgUrl = await getFirstImage(story.ThreadReaderURL, profile.ApostlePortraitURL);
    bg.style.backgroundImage = `url(${imgUrl})`;

    const overlay = document.createElement('div');
    overlay.className = 'card-overlay';
    overlay.innerHTML = `
      <h3>${story.StoryDescription || 'Untitled Story'}</h3>
      <p>${story.StoryDate || 'Date unknown'}</p>
    `;

    card.append(bg, overlay);
    grid.appendChild(card);
  }
}