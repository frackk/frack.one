/*
  coolstuff - frack.one
  V7: Spotify API ready

  Cómo funciona:
  - Si la API PHP de Spotify está configurada, las cards usan datos frescos de Spotify.
  - Si la API no está configurada o falla, la página usa esta lista local como backup.
  - CUSTOM_ORDER conserva el orden que veníamos usando. Si creás playlists nuevas en Spotify,
    aparecen al final automáticamente cuando la API esté configurada.
*/

const CUSTOM_ORDER = [
  '7bQIlv7WkTwX5a9T0yoNe4',
  '3LjG7eAzjgw1K5RpyYWBec',
  '3QmWwURsMVWzzxkdNGQgFR',
  '7wbt86dCdzrszM2Y58Hudf',
  '0JdEil5IjHJvYwYMibWQpZ',
  '0LxoLKkipIsWqanaBL77Wa',
  '1FvuW60nzgeW9XuRhHF8TB',
  '6oqfyQi9DH7PftOHn1Rj92',
  '3tcHx1wjr9G0tnwOHTFSFE',
  '2oyJ23jAXfGQtpmL9SaskH',
  '7jLjpAP21lEmH4TqIlJUij',
  '1KY75QRzzYf9nCgiMUXGQb',
  '5cZIdMWvx6mnHMFieGQG8i',
  '2QxnXEd2knDY72rkFvCXJY',
  '04Z9KCWEVYAWnZ01WMpe48',
  '340ZtccWv5H3K5Cg3qP4R3',
  '7h2wiOmf2SNMEdIvpCjjZ7',
  '2ORgLmXPejwqKsK5tCWWrO',
  '1kg01kbDLsYKEH4FB80sNE',
  '7hporxsiYQ6mRSFICCH90F',
  '5eNgpBZ976x2QG8n9ncJzs',
  '6mt9C4VnKd5tgQofkGWP84'
];

const FALLBACK_PLAYLISTS = [
  {
    id: '7bQIlv7WkTwX5a9T0yoNe4',
    title: 'dying',
    cover: 'https://image-cdn-fa.spotifycdn.com/image/ab67706c0000da84c94b65a68f2c4660a21fa7f5'
  },
  {
    id: '3LjG7eAzjgw1K5RpyYWBec',
    title: 'highway',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84cb479080240877a4f8f6a87e'
  },
  {
    id: '3QmWwURsMVWzzxkdNGQgFR',
    title: '1.6',
    cover: 'https://image-cdn-fa.spotifycdn.com/image/ab67706c0000d72cdeb78e664bb388172521659f'
  },
  {
    id: '7wbt86dCdzrszM2Y58Hudf',
    title: 'gus',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da848e1b2429dfa4e6e053d5e73d'
  },
  {
    id: '0JdEil5IjHJvYwYMibWQpZ',
    title: 'was i able to live inside your heart?',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000d72c09ef161c0a74cfbca4d479f1'
  },
  {
    id: '0LxoLKkipIsWqanaBL77Wa',
    title: 'eng',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000d72ce62115bda32f6e739bb5c8e8'
  },
  {
    id: '1FvuW60nzgeW9XuRhHF8TB',
    title: 'scenarios',
    cover: 'https://image-cdn-fa.spotifycdn.com/image/ab67706c0000da84f4c34ed3dc5a51874d7e4cf3'
  },
  {
    id: '6oqfyQi9DH7PftOHn1Rj92',
    title: 'rainnight',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da8451d08d35735441684e6bbe76'
  },
  {
    id: '3tcHx1wjr9G0tnwOHTFSFE',
    title: 'Y-Y',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000d72c0e967f1e6d5e66f9c92ad336'
  },
  {
    id: '2oyJ23jAXfGQtpmL9SaskH',
    title: "can't explain '17",
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da8435a01031073093123c11c877'
  },
  {
    id: '7jLjpAP21lEmH4TqIlJUij',
    title: 'ts13',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da8416d092836ef1483f52df5f3e'
  },
  {
    id: '1KY75QRzzYf9nCgiMUXGQb',
    title: 'ohne ziel',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da848cc090d13cd3044c061cd1bc'
  },
  {
    id: '5cZIdMWvx6mnHMFieGQG8i',
    title: 'tsi',
    cover: 'https://image-cdn-fa.spotifycdn.com/image/ab67706c0000da84c224a093d0a6390500d9d99f'
  },
  {
    id: '2QxnXEd2knDY72rkFvCXJY',
    title: 'drill',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000d72c863187727fc4ce89ad343ac3'
  },
  {
    id: '04Z9KCWEVYAWnZ01WMpe48',
    title: 'd&b',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84c3801444cfa15bd89ebe12e7'
  },
  {
    id: '340ZtccWv5H3K5Cg3qP4R3',
    title: 'kr',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000d72c1914b7cabd7bca76095afafd'
  },
  {
    id: '7h2wiOmf2SNMEdIvpCjjZ7',
    title: 'ar',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000d72c9c993a39a06528b0d792ae0a'
  },
  {
    id: '2ORgLmXPejwqKsK5tCWWrO',
    title: '240km/h crash',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000d72c63c494dee366ad298919327c'
  },
  {
    id: '1kg01kbDLsYKEH4FB80sNE',
    title: 'math',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000d72c974ec7c385e460a97feed335'
  },
  {
    id: '7hporxsiYQ6mRSFICCH90F',
    title: 'gyal',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84564554f039a7dfe5c7674fb8'
  },
  {
    id: '5eNgpBZ976x2QG8n9ncJzs',
    title: 'mds',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da844b53ef7825e26e39e0895e7c'
  },
  {
    id: '6mt9C4VnKd5tgQofkGWP84',
    title: 'buenos aires',
    cover: 'https://image-cdn-ak.spotifycdn.com/image/ab67706c0000da84a46949934774b28dcc82516b'
  }
];

const API_URL = 'api/spotify-playlists.php';

const grid = document.getElementById('playlistGrid');
const emptyNote = document.getElementById('emptyNote');
const modal = document.getElementById('previewModal');
const frame = document.getElementById('spotifyFrame');
const modalTitle = document.getElementById('modalTitle');

function playlistUrl(id) {
  return `https://open.spotify.com/playlist/${id}`;
}

function embedUrl(id) {
  return `https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0`;
}

function setBackground(playlist) {
  const cover = playlist.cover || '';
  document.documentElement.style.setProperty('--glow-a', 'rgba(118,118,118,.24)');
  document.documentElement.style.setProperty('--glow-b', 'rgba(42,42,42,.22)');
  document.documentElement.style.setProperty('--glow-c', 'rgba(255,255,255,.06)');
  document.documentElement.style.setProperty('--glow-image', cover ? `url("${cover}")` : 'none');
  document.body.classList.add('has-glow');
}

function resetBackground() {
  if (!modal.classList.contains('is-open')) {
    document.body.classList.remove('has-glow');
  }
}

function openPreview(playlist) {
  modalTitle.textContent = playlist.title;
  frame.src = embedUrl(playlist.id);
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
  setBackground(playlist);
}

function closePreview() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  frame.src = '';
  document.body.style.overflow = '';
  document.body.classList.remove('has-glow');
}

function createCard(playlist) {
  const article = document.createElement('article');
  article.className = 'card';

  const coverWrap = document.createElement('div');
  coverWrap.className = 'cover-wrap';
  coverWrap.setAttribute('role', 'button');
  coverWrap.setAttribute('tabindex', '0');
  coverWrap.setAttribute('aria-label', `preview ${playlist.title}`);

  const image = document.createElement('img');
  image.className = 'cover';
  image.src = playlist.cover;
  image.alt = `${playlist.title} playlist cover`;
  image.loading = 'lazy';
  coverWrap.appendChild(image);

  const title = document.createElement('h2');
  title.className = 'title';
  title.textContent = playlist.title;

  const actions = document.createElement('div');
  actions.className = 'actions';

  const previewButton = document.createElement('button');
  previewButton.className = 'btn preview';
  previewButton.type = 'button';
  previewButton.textContent = 'preview';

  const spotifyButton = document.createElement('a');
  spotifyButton.className = 'btn';
  spotifyButton.href = playlist.url || playlistUrl(playlist.id);
  spotifyButton.target = '_blank';
  spotifyButton.rel = 'noopener noreferrer';
  spotifyButton.textContent = 'open spotify';

  actions.append(previewButton, spotifyButton);
  article.append(coverWrap, title, actions);

  coverWrap.addEventListener('mouseenter', () => setBackground(playlist));
  coverWrap.addEventListener('mouseleave', resetBackground);
  coverWrap.addEventListener('focus', () => setBackground(playlist));
  coverWrap.addEventListener('blur', resetBackground);
  coverWrap.addEventListener('touchstart', () => setBackground(playlist), { passive: true });

  coverWrap.addEventListener('click', () => openPreview(playlist));
  previewButton.addEventListener('click', () => openPreview(playlist));

  coverWrap.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      openPreview(playlist);
    }
  });

  return article;
}

function sortPlaylists(playlists) {
  const position = new Map(CUSTOM_ORDER.map((id, index) => [id, index]));

  return [...playlists].sort((a, b) => {
    const aPos = position.has(a.id) ? position.get(a.id) : Number.MAX_SAFE_INTEGER;
    const bPos = position.has(b.id) ? position.get(b.id) : Number.MAX_SAFE_INTEGER;

    if (aPos !== bPos) return aPos - bPos;
    return (a.title || '').localeCompare(b.title || '', undefined, { sensitivity: 'base' });
  });
}

function normalizePlaylist(playlist) {
  return {
    id: playlist.id,
    title: playlist.title || playlist.name || 'untitled',
    cover: playlist.cover || playlist.image || '',
    url: playlist.url || playlist.external_url || playlistUrl(playlist.id)
  };
}

function render(playlists = FALLBACK_PLAYLISTS) {
  grid.innerHTML = '';

  const cleanPlaylists = sortPlaylists(
    playlists
      .map(normalizePlaylist)
      .filter((playlist) => playlist.id && playlist.cover)
  );

  if (!cleanPlaylists.length) {
    emptyNote.style.display = 'block';
    return;
  }

  emptyNote.style.display = 'none';
  cleanPlaylists.forEach((playlist) => grid.appendChild(createCard(playlist)));
}

async function loadPlaylists() {
  render(FALLBACK_PLAYLISTS);

  try {
    const response = await fetch(`${API_URL}?t=${Date.now()}`, {
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) return;

    const data = await response.json();
    if (Array.isArray(data.playlists) && data.playlists.length) {
      render(data.playlists);
    }
  } catch (error) {
    // Si estás usando Live Server o todavía no configuraste la API en Hostinger,
    // simplemente queda activa la lista local.
  }
}

document.querySelectorAll('[data-close-modal]').forEach((element) => {
  element.addEventListener('click', closePreview);
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal.classList.contains('is-open')) {
    closePreview();
  }
});

loadPlaylists();
