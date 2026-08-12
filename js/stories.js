// js/stories.js
document.addEventListener('DOMContentLoaded', async () => {
  await fetchData();
  const params = new URLSearchParams(location.search);
  renderStories(params.get('apostle'));
});

function renderStories(apostleName) {
  const headerName = document.getElementById('apostle-name');
  const headerDates = document.getElementById('apostle-dates');
  const grid = document.getElementById('stories-grid');
  grid.innerHTML = '';

  if (!apostleName) {
    headerName.textContent = 'No apostle selected';
    return;
  }

  const profile = getPreferredApostleData(apostleName);
  if (!profile) {
    headerName.textContent = 'Apostle not found';
    const message = document.createElement('p');
    message.textContent = `No apostle named “${apostleName}” was found.`;
    grid.appendChild(message);
    return;
  }

  headerName.textContent = `${profile.ApostleName} (#${profile.ApostleNumber})`;
  if (profile.SeasonNumber) {
    headerName.textContent += ` – Season ${profile.SeasonNumber}`;
  }
  headerDates.innerHTML = `Born: ${profile.BirthDate || '—'} | Called: ${profile.CallDate || '—'}<br>${formatDeathLabel(profile.DeathDate)}`;

  const stories = getStoriesForApostle(apostleName);

  for (const story of stories) {
    const card = document.createElement('a');
    card.href = story.ThreadReaderURL || story.ThreadLink;
    card.target = '_blank';
    card.rel = 'noopener';
    card.className = 'card';

    const bg = document.createElement('div');
    bg.className = 'card-bg';

    let imgUrl = 'img/placeholder.jpg';

    if (story.StoryImageURL && story.StoryImageURL.trim() && story.StoryImageURL.trim() !== 'No Image') {
      imgUrl = story.StoryImageURL.trim();
    } else if (profile.ApostlePortraitURL && profile.ApostlePortraitURL.trim()) {
      imgUrl = profile.ApostlePortraitURL.trim();
    }

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
