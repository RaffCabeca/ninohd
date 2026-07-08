/* ══════════════════════════════════════════════════════════════
   NinoHD — Frontend
   Toda a interface construída por JavaScript.
   ══════════════════════════════════════════════════════════════ */

// ─── HELPERS ──────────────────────────────────────────────────
function el(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  if (attrs) for (const [k, v] of Object.entries(attrs)) {
    if (k === 'className') e.className = v;
    else if (k === 'html') e.innerHTML = v;
    else if (k === 'text') e.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') e.addEventListener(k.slice(2).toLowerCase(), v);
    else if (v !== null && v !== false) e.setAttribute(k, v);
  }
  kids.flat(Infinity).forEach(c => { if (c == null) return; e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
  return e;
}
function svgEl(s) { const t = document.createElement('template'); t.innerHTML = s.trim(); return t.content.firstChild; }
function esc(s) { return (s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

const I = {
  film: '<svg viewBox="0 0 24 24"><path d="M18 3v2h-2V3H8v2H6V3H4v18h2v-2h2v2h8v-2h2v2h2V3h-2zM8 17H6v-2h2v2zm0-4H6v-2h2v2zm0-4H6V7h2v2zm10 8h-2v-2h2v2zm0-4h-2v-2h2v2zm0-4h-2V7h2v2z"/></svg>',
  search: '<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 10-.7.7l.27.28v.79l5 5 1.5-1.5-5-5zm-6 0a4.5 4.5 0 110-9 4.5 4.5 0 010 9z"/></svg>',
  play: '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  star: '<svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>',
  chat: '<svg viewBox="0 0 24 24"><path d="M20 2H4a2 2 0 00-2 2v18l4-4h14a2 2 0 002-2V4a2 2 0 00-2-2z"/></svg>',
  send: '<svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2z"/></svg>',
  sun: '<svg viewBox="0 0 24 24"><path d="M6.76 4.84l-1.8-1.79-1.41 1.41 1.79 1.79 1.42-1.41zM4 10.5H1v2h3v-2zm9-9.95h-2V3.5h2V.55zm7.45 3.91l-1.41-1.41-1.79 1.79 1.41 1.41 1.79-1.79zm-3.21 13.7l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 10.5v2h3v-2h-3zm-8-5a6 6 0 100 12 6 6 0 000-12zm-1 16.95h2V19.5h-2v2.95zm-7.45-3.91l1.41 1.41 1.79-1.8-1.41-1.41-1.79 1.8z"/></svg>',
  moon: '<svg viewBox="0 0 24 24"><path d="M12.3 4.9c.4-.2.3-.8-.1-.9a8 8 0 108.8 8.8c-.1-.4-.7-.5-.9-.1a5.4 5.4 0 01-7.8-7.8z"/></svg>',
  lock: '<svg viewBox="0 0 24 24"><path d="M18 8h-1V6A5 5 0 007 6v2H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V10a2 2 0 00-2-2zm-6 9a2 2 0 110-4 2 2 0 010 4zm3-9H9V6a3 3 0 016 0v2z"/></svg>',
  reel: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a2 2 0 110 4 2 2 0 010-4zm-4 4a2 2 0 110 4 2 2 0 010-4zm8 0a2 2 0 110 4 2 2 0 010-4zm-4 4a2 2 0 110 4 2 2 0 010-4z"/></svg>',
};

// ─── STATE ────────────────────────────────────────────────────
const S = {
  films: [],
  filter: 'todos',
  search: '',
  theme: localStorage.getItem('ninohd-theme') || 'dark',
  adminToken: sessionStorage.getItem('ninohd-admin') || null,
  chatHistory: [],
  editingId: null,
};

const CATEGORIES = [
  { id: 'todos', label: 'Todos' },
  { id: 'em-alta', label: '🔥 Em Alta' },
  { id: 'tops', label: '⭐ Tops' },
  { id: 'infantil', label: 'Infantil' },
  { id: 'adolescente', label: 'Adolescente' },
  { id: 'adulto', label: 'Adulto (16+)' },
  { id: 'acao', label: 'Ação' },
  { id: 'comedia', label: 'Comédia' },
  { id: 'drama', label: 'Drama' },
  { id: 'terror', label: 'Terror' },
  { id: 'ficcao', label: 'Ficção' },
  { id: 'romance', label: 'Romance' },
  { id: 'animacao', label: 'Animação' },
  { id: 'documentario', label: 'Documentário' },
];

const GENRE_MAP = {
  acao: 'ação', comedia: 'comédia', drama: 'drama', terror: 'terror',
  ficcao: 'ficção', romance: 'romance', animacao: 'animação', documentario: 'documentário',
};

// ─── VIDEO LINK HANDLING ──────────────────────────────────────
function resolveEmbed(link) {
  const url = link.trim();
  // YouTube
  let m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (m) return { type: 'iframe', src: `https://www.youtube.com/embed/${m[1]}` };
  // Google Drive
  m = url.match(/drive\.google\.com\/file\/d\/([\w-]+)/);
  if (m) return { type: 'iframe', src: `https://drive.google.com/file/d/${m[1]}/preview` };
  // Vimeo
  m = url.match(/vimeo\.com\/(\d+)/);
  if (m) return { type: 'iframe', src: `https://player.vimeo.com/video/${m[1]}` };
  // Direct video file
  if (/\.(mp4|webm|ogg|mkv|m4v|mov)(\?|$)/i.test(url)) return { type: 'video', src: url };
  // Fallback: try iframe
  return { type: 'iframe', src: url };
}

// ─── API ──────────────────────────────────────────────────────
async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...(opts.headers || {}) };
  if (S.adminToken) headers['Authorization'] = 'Bearer ' + S.adminToken;
  const res = await fetch(path, { ...opts, headers });
  return res;
}

async function loadFilms() {
  try {
    const res = await fetch('/api/films');
    const data = await res.json();
    S.films = data.films || [];
  } catch (e) { S.films = []; }
  renderFilms();
}

// ─── SECURITY (leve) ──────────────────────────────────────────
(function(){
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('keydown', e => {
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key)) || (e.ctrlKey && e.key === 'u')) {
      e.preventDefault();
    }
  });
  console.log('%c🎬 NinoHD', 'font-size:20px;font-weight:bold;color:#8B5CF6');
})();

// ─── THEME ────────────────────────────────────────────────────
function applyTheme(t) {
  S.theme = t;
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('ninohd-theme', t);
  const btn = document.getElementById('theme-icon');
  if (btn) btn.replaceWith(mkThemeIcon());
}
function mkThemeIcon() {
  const ic = svgEl(S.theme === 'dark' ? I.sun : I.moon);
  ic.id = 'theme-icon'; ic.style.width = '19px'; ic.style.height = '19px'; ic.setAttribute('fill', 'var(--text-2)');
  return ic;
}

// ═══════════════════════════════════════════════════════════════
// BUILD — TOPBAR
// ═══════════════════════════════════════════════════════════════
function buildTopbar() {
  const bar = el('header', { className: 'topbar' });

  const brand = el('div', { className: 'brand' });
  const mark = el('img', { className: 'brand-mark', src: '/static/logo.svg', alt: 'NinoHD' });
  const name = el('div', { className: 'brand-name', html: 'NINO<span>HD</span>' });
  brand.append(mark, name);

  const search = el('div', { className: 'topbar-search' });
  search.appendChild(svgEl(I.search));
  const searchInput = el('input', { type: 'text', placeholder: 'Buscar filme, gênero ou diretor...' });
  searchInput.addEventListener('input', e => { S.search = e.target.value.toLowerCase(); renderFilms(); });
  search.appendChild(searchInput);

  const actions = el('div', { className: 'topbar-actions' });
  const themeBtn = el('button', { className: 'icon-btn', 'aria-label': 'Tema', onClick: () => applyTheme(S.theme === 'dark' ? 'light' : 'dark') });
  themeBtn.appendChild(mkThemeIcon());
  actions.appendChild(themeBtn);

  const adminBtn = el('button', { id: 'admin-btn', className: 'admin-badge', onClick: onAdminClick,
    text: S.adminToken ? 'Painel Admin' : 'Entrar' });
  actions.appendChild(adminBtn);

  bar.append(brand, search, actions);
  return bar;
}

// ═══════════════════════════════════════════════════════════════
// BUILD — HERO
// ═══════════════════════════════════════════════════════════════
function buildHero() {
  const hero = el('section', { className: 'hero', id: 'inicio' });
  hero.appendChild(el('div', { className: 'hero-bg' }));
  hero.appendChild(el('div', { className: 'hero-beam' }));
  hero.appendChild(el('div', { className: 'hero-grain' }));

  const content = el('div', { className: 'hero-content' });
  content.appendChild(el('div', { className: 'hero-eyebrow', text: 'Seu cinema, sem limites' }));
  content.appendChild(el('h1', { className: 'hero-title', html: 'ASSISTA<br>DE <em>TUDO</em>' }));
  content.appendChild(el('p', { className: 'hero-sub', text: 'Filmes em alta, clássicos, lançamentos e sessões para toda a família. Do infantil ao adulto, tudo num lugar só. É só dar o play.' }));

  const actions = el('div', { className: 'hero-actions' });
  const btnPlay = el('button', { className: 'btn-primary', onClick: () => document.getElementById('catalogo').scrollIntoView({ behavior: 'smooth' }) });
  btnPlay.appendChild(svgEl(I.play)); btnPlay.appendChild(document.createTextNode('Explorar catálogo'));
  const btnChat = el('button', { className: 'btn-ghost', onClick: toggleChat });
  btnChat.appendChild(svgEl(I.chat)); btnChat.appendChild(document.createTextNode('Falar com o NINO'));
  actions.append(btnPlay, btnChat);
  content.appendChild(actions);

  hero.appendChild(content);
  return hero;
}

// ═══════════════════════════════════════════════════════════════
// BUILD — STATS
// ═══════════════════════════════════════════════════════════════
function buildStats() {
  const stats = el('div', { className: 'stats', id: 'stats-strip' });
  return stats;
}
function renderStats() {
  const strip = document.getElementById('stats-strip');
  if (!strip) return;
  strip.innerHTML = '';
  const total = S.films.length;
  const trending = S.films.filter(f => f.trending).length;
  const genres = new Set(S.films.map(f => (f.genre || '').toLowerCase()).filter(Boolean)).size;
  const data = [
    { num: total, label: 'Filmes' },
    { num: trending, label: 'Em alta' },
    { num: genres, label: 'Gêneros' },
    { num: 'HD', label: 'Qualidade' },
  ];
  data.forEach(d => {
    const s = el('div', { className: 'stat' });
    s.appendChild(el('div', { className: 'stat-num', text: String(d.num) }));
    s.appendChild(el('div', { className: 'stat-label', text: d.label }));
    strip.appendChild(s);
  });
}

// ═══════════════════════════════════════════════════════════════
// BUILD — FILTERS
// ═══════════════════════════════════════════════════════════════
function buildFilters() {
  const filters = el('div', { className: 'filters', id: 'filters' });
  CATEGORIES.forEach(cat => {
    const chip = el('button', {
      className: 'filter-chip' + (cat.id === S.filter ? ' active' : ''),
      text: cat.label, 'data-cat': cat.id,
      onClick: () => {
        S.filter = cat.id;
        document.querySelectorAll('.filter-chip').forEach(c => c.classList.toggle('active', c.getAttribute('data-cat') === cat.id));
        renderFilms();
      }
    });
    filters.appendChild(chip);
  });
  return filters;
}

// ═══════════════════════════════════════════════════════════════
// BUILD — CATALOG
// ═══════════════════════════════════════════════════════════════
function buildCatalog() {
  const section = el('section', { className: 'section', id: 'catalogo' });
  const head = el('div', { className: 'section-head' });
  const title = el('div', { className: 'section-title' });
  title.appendChild(el('span', { className: 'dot' }));
  title.appendChild(el('span', { id: 'catalog-title', text: 'Catálogo' }));
  head.appendChild(title);
  head.appendChild(el('div', { className: 'section-count', id: 'catalog-count', text: '' }));
  section.appendChild(head);
  section.appendChild(el('div', { className: 'film-grid', id: 'film-grid' }));
  return section;
}

function filterFilms() {
  let list = S.films.slice();
  const f = S.filter;
  if (f === 'em-alta') list = list.filter(x => x.trending);
  else if (f === 'tops') list = list.filter(x => parseFloat(x.rating) >= 8).sort((a,b) => parseFloat(b.rating||0) - parseFloat(a.rating||0));
  else if (f === 'infantil') list = list.filter(x => x.age === 'livre' || x.age === 'infantil');
  else if (f === 'adolescente') list = list.filter(x => x.age === 'adolescente');
  else if (f === 'adulto') list = list.filter(x => x.age === 'adulto');
  else if (GENRE_MAP[f]) list = list.filter(x => (x.genre || '').toLowerCase().includes(GENRE_MAP[f]));

  if (S.search) {
    list = list.filter(x =>
      (x.title || '').toLowerCase().includes(S.search) ||
      (x.genre || '').toLowerCase().includes(S.search) ||
      (x.description || '').toLowerCase().includes(S.search)
    );
  }
  return list;
}

function renderFilms() {
  const grid = document.getElementById('film-grid');
  if (!grid) return;
  grid.innerHTML = '';
  const list = filterFilms();

  const catTitle = document.getElementById('catalog-title');
  const cat = CATEGORIES.find(c => c.id === S.filter);
  if (catTitle) catTitle.textContent = cat ? cat.label.replace(/^[^\w]+/, '') : 'Catálogo';
  const count = document.getElementById('catalog-count');
  if (count) count.textContent = list.length ? `${list.length} título${list.length > 1 ? 's' : ''}` : '';

  if (!list.length) {
    const empty = el('div', { className: 'empty-state' });
    empty.appendChild(svgEl(I.reel));
    empty.appendChild(el('h3', { text: S.films.length ? 'Nada por aqui ainda' : 'Catálogo vazio' }));
    empty.appendChild(el('p', { text: S.adminToken ? 'Use o painel admin para colar links de filmes.' : 'Novos filmes chegam em breve. Volte logo!' }));
    grid.appendChild(empty);
    renderStats();
    return;
  }

  list.forEach(f => grid.appendChild(buildFilmCard(f)));
  renderStats();
}

function buildFilmCard(f) {
  const card = el('div', { className: 'film-card' });

  // Poster
  const poster = el('div', { className: 'film-poster', onClick: () => openPlayer(f) });
  if (f.poster) {
    poster.appendChild(el('img', { src: f.poster, alt: f.title || 'Filme', loading: 'lazy',
      onerror: function(){ this.style.display='none'; } }));
  } else {
    const empty = el('div', { className: 'film-poster-empty' });
    empty.appendChild(svgEl(I.film));
    empty.appendChild(el('span', { text: 'Sem capa' }));
    poster.appendChild(empty);
  }

  // Badges
  const badges = el('div', { className: 'film-badges' });
  if (f.trending) badges.appendChild(el('span', { className: 'badge badge-trending', text: 'Em alta' }));
  const ageLabel = { livre: 'Livre', infantil: 'Livre', adolescente: '14+', adulto: '16+' }[f.age] || 'Livre';
  const ageClass = f.age === 'adolescente' ? 'adolescente' : f.age === 'adulto' ? 'adulto' : 'livre';
  badges.appendChild(el('span', { className: 'badge badge-age ' + ageClass, text: ageLabel }));
  poster.appendChild(badges);

  // Play overlay
  const play = el('div', { className: 'film-play' });
  const playBtn = el('div', { className: 'film-play-btn' }); playBtn.appendChild(svgEl(I.play));
  play.appendChild(playBtn);
  poster.appendChild(play);
  card.appendChild(poster);

  // Info
  const info = el('div', { className: 'film-info' });
  info.appendChild(el('div', { className: 'film-title', text: f.title || 'Filme sem título' }));

  const meta = el('div', { className: 'film-meta' });
  if (f.year) meta.appendChild(el('span', { text: f.year }));
  if (f.duration) meta.appendChild(el('span', { text: '· ' + f.duration }));
  if (f.rating) {
    const r = el('span', { className: 'rating' }); r.appendChild(svgEl(I.star)); r.appendChild(document.createTextNode(f.rating));
    meta.appendChild(r);
  }
  info.appendChild(meta);

  if (f.genre) {
    const tags = el('div', { className: 'film-genre-tags' });
    f.genre.split(',').map(g => g.trim()).filter(Boolean).slice(0, 3).forEach(g => tags.appendChild(el('span', { className: 'genre-tag', text: g })));
    info.appendChild(tags);
  }

  if (f.description) info.appendChild(el('div', { className: 'film-desc', text: f.description }));

  // Admin actions
  if (S.adminToken) {
    const actions = el('div', { className: 'film-admin-actions' });
    actions.appendChild(el('button', { className: 'btn-edit', text: 'Editar', onClick: (e) => { e.stopPropagation(); openEditDrawer(f); } }));
    actions.appendChild(el('button', { className: 'btn-del', text: 'Excluir', onClick: (e) => { e.stopPropagation(); deleteFilm(f.id); } }));
    info.appendChild(actions);
  }

  card.appendChild(info);
  return card;
}

// ═══════════════════════════════════════════════════════════════
// PLAYER MODAL
// ═══════════════════════════════════════════════════════════════
function buildPlayerModal() {
  const modal = el('div', { className: 'modal', id: 'player-modal', onClick: (e) => { if (e.target.id === 'player-modal') closePlayer(); } });
  const box = el('div', { className: 'modal-player' });
  const head = el('div', { className: 'modal-player-head' });
  head.appendChild(el('div', { className: 'modal-player-title', id: 'player-title', text: '' }));
  const close = el('button', { className: 'modal-close', onClick: closePlayer }); close.appendChild(svgEl(I.close));
  head.appendChild(close);
  box.appendChild(head);
  box.appendChild(el('div', { className: 'modal-video', id: 'player-video' }));
  const body = el('div', { className: 'modal-player-body' });
  body.appendChild(el('div', { className: 'modal-player-meta', id: 'player-meta' }));
  body.appendChild(el('div', { className: 'modal-player-desc', id: 'player-desc' }));
  box.appendChild(body);
  modal.appendChild(box);
  return modal;
}

function openPlayer(f) {
  document.getElementById('player-title').textContent = f.title || 'Reproduzindo';
  const videoBox = document.getElementById('player-video');
  videoBox.innerHTML = '';
  const embed = resolveEmbed(f.link);
  if (embed.type === 'video') {
    const v = el('video', { src: embed.src, controls: 'true', autoplay: 'true' });
    videoBox.appendChild(v);
  } else {
    const iframe = el('iframe', { src: embed.src, allow: 'autoplay; fullscreen; encrypted-media', allowfullscreen: 'true' });
    videoBox.appendChild(iframe);
  }
  const meta = document.getElementById('player-meta');
  meta.innerHTML = '';
  [f.year, f.genre, f.duration, f.rating ? '★ ' + f.rating : ''].filter(Boolean).forEach(x => meta.appendChild(el('span', { text: x })));
  document.getElementById('player-desc').textContent = f.description || '';
  document.getElementById('player-modal').classList.add('active');
}
function closePlayer() {
  document.getElementById('player-video').innerHTML = '';
  document.getElementById('player-modal').classList.remove('active');
}

// ═══════════════════════════════════════════════════════════════
// ADMIN
// ═══════════════════════════════════════════════════════════════
function onAdminClick() {
  if (S.adminToken) {
    const panel = document.getElementById('admin-panel');
    panel.classList.toggle('active');
    if (panel.classList.contains('active')) panel.scrollIntoView({ behavior: 'smooth' });
  } else {
    document.getElementById('login-modal').classList.add('active');
    setTimeout(() => document.getElementById('login-input').focus(), 100);
  }
}

function buildLoginModal() {
  const modal = el('div', { className: 'login-modal', id: 'login-modal', onClick: (e) => { if (e.target.id === 'login-modal') closeLogin(); } });
  const box = el('div', { className: 'login-box' });
  box.appendChild(el('h3', { text: 'Acesso restrito' }));
  box.appendChild(el('p', { text: 'Só o administrador vê a ferramenta de publicar filmes.' }));
  box.appendChild(el('div', { className: 'login-error', id: 'login-error', text: 'Senha incorreta.' }));
  const input = el('input', { id: 'login-input', type: 'password', placeholder: 'Senha do administrador' });
  input.addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  box.appendChild(input);
  const btns = el('div', { className: 'login-btns' });
  btns.appendChild(el('button', { className: 'login-cancel', text: 'Cancelar', onClick: closeLogin }));
  btns.appendChild(el('button', { className: 'login-enter', text: 'Entrar', onClick: doLogin }));
  box.appendChild(btns);
  modal.appendChild(box);
  return modal;
}
function closeLogin() { document.getElementById('login-modal').classList.remove('active'); document.getElementById('login-error').style.display = 'none'; }

async function doLogin() {
  const pass = document.getElementById('login-input').value;
  try {
    const res = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password: pass }) });
    if (res.ok) {
      const data = await res.json();
      S.adminToken = data.token;
      sessionStorage.setItem('ninohd-admin', data.token);
      closeLogin();
      document.getElementById('admin-btn').textContent = 'Painel Admin';
      document.getElementById('admin-panel').classList.add('active');
      document.getElementById('admin-panel').scrollIntoView({ behavior: 'smooth' });
      renderFilms();
    } else {
      document.getElementById('login-error').style.display = 'block';
    }
  } catch (e) {
    document.getElementById('login-error').textContent = 'Erro de conexão.';
    document.getElementById('login-error').style.display = 'block';
  }
}

// ─── ADMIN PANEL com 300 barras ───────────────────────────────
const MAX_BARS = 300;
function buildAdminPanel() {
  const panel = el('section', { className: 'admin-panel' + (S.adminToken ? ' active' : ''), id: 'admin-panel' });

  const head = el('div', { className: 'admin-head' });
  const title = el('div', { className: 'admin-title' });
  const lock = svgEl(I.lock); lock.style.width = '22px'; lock.style.height = '22px'; lock.classList.add('lock'); lock.setAttribute('fill', 'var(--amber)');
  title.appendChild(lock); title.appendChild(document.createTextNode('Ferramenta de publicação'));
  head.appendChild(title);
  head.appendChild(el('button', { className: 'btn-ghost', text: 'Sair da conta', onClick: adminLogout }));
  panel.appendChild(head);

  panel.appendChild(el('p', { className: 'admin-sub', text: 'Cole o link do filme (do SnapTube, YouTube, Google Drive, Vimeo ou arquivo .mp4 direto) e publique. O filme aparece no catálogo para todos os visitantes. Depois é só clicar em Editar no card para adicionar capa, título, gênero e informações.' }));

  // Bulk paste
  const bulk = el('div', { className: 'admin-bulk' });
  bulk.appendChild(el('h4', { text: 'Colar vários de uma vez' }));
  bulk.appendChild(el('p', { text: 'Um link por linha. Publica todos de uma vez.' }));
  const textarea = el('textarea', { id: 'bulk-input', placeholder: 'https://...\nhttps://...\nhttps://...' });
  bulk.appendChild(textarea);
  bulk.appendChild(el('button', { className: 'admin-bulk-btn', text: 'Publicar todos', onClick: publishBulk }));
  panel.appendChild(bulk);

  // 300 bars
  const barsHead = el('div', { className: 'admin-bars-head' });
  barsHead.appendChild(el('h4', { text: 'Barras de link' }));
  barsHead.appendChild(el('div', { className: 'admin-counter', id: 'bars-counter', html: '<b>0</b> de 300 publicados' }));
  panel.appendChild(barsHead);

  const bars = el('div', { className: 'admin-bars', id: 'admin-bars' });
  for (let i = 1; i <= MAX_BARS; i++) {
    const bar = el('div', { className: 'link-bar', 'data-bar': i });
    bar.appendChild(el('span', { className: 'link-bar-num', text: String(i).padStart(3, '0') }));
    const input = el('input', { type: 'text', placeholder: 'Cole o link do filme #' + i });
    input.addEventListener('keydown', e => { if (e.key === 'Enter') publishBar(bar, input); });
    bar.appendChild(input);
    const btn = el('button', { text: 'Publicar', onClick: () => publishBar(bar, input) });
    bar.appendChild(btn);
    bars.appendChild(bar);
  }
  panel.appendChild(bars);

  return panel;
}

function updateBarsCounter() {
  const done = document.querySelectorAll('.link-bar.done').length;
  const c = document.getElementById('bars-counter');
  if (c) c.innerHTML = `<b>${done}</b> de 300 publicados`;
}

async function publishBar(bar, input) {
  const link = input.value.trim();
  if (!link) { input.focus(); return; }
  const btn = bar.querySelector('button');
  btn.disabled = true; btn.textContent = '...';
  try {
    const res = await api('/api/admin/films', { method: 'POST', body: JSON.stringify({ link }) });
    if (res.ok) {
      const data = await res.json();
      S.films.unshift(data.film);
      bar.classList.add('done');
      btn.textContent = 'Publicado ✓';
      input.disabled = true;
      renderFilms();
      updateBarsCounter();
    } else {
      btn.disabled = false; btn.textContent = 'Publicar';
      if (res.status === 401) handleAuthFail();
    }
  } catch (e) { btn.disabled = false; btn.textContent = 'Publicar'; }
}

async function publishBulk() {
  const raw = document.getElementById('bulk-input').value;
  const links = raw.split('\n').map(l => l.trim()).filter(Boolean);
  if (!links.length) return;
  try {
    const res = await api('/api/admin/films/bulk', { method: 'POST', body: JSON.stringify({ links }) });
    if (res.ok) {
      const data = await res.json();
      data.added.forEach(f => S.films.unshift(f));
      document.getElementById('bulk-input').value = '';
      renderFilms();
      openEditDrawer(data.added[0]);
    } else if (res.status === 401) handleAuthFail();
  } catch (e) {}
}

function adminLogout() {
  S.adminToken = null;
  sessionStorage.removeItem('ninohd-admin');
  document.getElementById('admin-panel').classList.remove('active');
  document.getElementById('admin-btn').textContent = 'Entrar';
  renderFilms();
}
function handleAuthFail() { adminLogout(); alert('Sua sessão expirou. Faça login novamente.'); }

// ─── EDIT DRAWER ──────────────────────────────────────────────
function buildDrawer() {
  const overlay = el('div', { className: 'drawer-overlay', id: 'drawer-overlay', onClick: closeDrawer });
  const drawer = el('div', { className: 'drawer', id: 'drawer' });
  drawer.appendChild(el('h3', { text: 'Editar filme' }));
  drawer.appendChild(el('div', { className: 'drawer-sub', id: 'drawer-link', text: '' }));

  const fields = [
    { id: 'title', label: 'Título', type: 'text' },
    { id: 'poster', label: 'URL da capa (imagem)', type: 'text' },
  ];
  fields.forEach(f => {
    const field = el('div', { className: 'field' });
    field.appendChild(el('label', { text: f.label }));
    field.appendChild(el('input', { id: 'edit-' + f.id, type: f.type }));
    drawer.appendChild(field);
  });

  const row1 = el('div', { className: 'field field-row' });
  ['year', 'duration'].forEach((id, i) => {
    const sub = el('div');
    sub.appendChild(el('label', { text: i === 0 ? 'Ano' : 'Duração' }));
    sub.appendChild(el('input', { id: 'edit-' + id, type: 'text', placeholder: i === 0 ? '2024' : '120min' }));
    row1.appendChild(sub);
  });
  drawer.appendChild(row1);

  const row2 = el('div', { className: 'field field-row' });
  const genreSub = el('div');
  genreSub.appendChild(el('label', { text: 'Gênero' }));
  genreSub.appendChild(el('input', { id: 'edit-genre', type: 'text', placeholder: 'Ação, Drama' }));
  row2.appendChild(genreSub);
  const ratingSub = el('div');
  ratingSub.appendChild(el('label', { text: 'Nota' }));
  ratingSub.appendChild(el('input', { id: 'edit-rating', type: 'text', placeholder: '8.5' }));
  row2.appendChild(ratingSub);
  drawer.appendChild(row2);

  const ageField = el('div', { className: 'field' });
  ageField.appendChild(el('label', { text: 'Faixa etária' }));
  const ageSelect = el('select', { id: 'edit-age' });
  [['livre', 'Livre / Infantil'], ['adolescente', 'Adolescente (14+)'], ['adulto', 'Adulto (16+)']].forEach(([v, l]) => {
    ageSelect.appendChild(el('option', { value: v, text: l }));
  });
  ageField.appendChild(ageSelect);
  drawer.appendChild(ageField);

  const descField = el('div', { className: 'field' });
  descField.appendChild(el('label', { text: 'Sinopse' }));
  descField.appendChild(el('textarea', { id: 'edit-description', placeholder: 'Do que se trata o filme...' }));
  drawer.appendChild(descField);

  const trendField = el('div', { className: 'field field-check' });
  trendField.appendChild(el('input', { id: 'edit-trending', type: 'checkbox' }));
  trendField.appendChild(el('label', { text: 'Marcar como "Em alta"', style: 'margin:0;text-transform:none;font-size:.86rem;color:var(--text)' }));
  drawer.appendChild(trendField);

  const actions = el('div', { className: 'drawer-actions' });
  actions.appendChild(el('button', { className: 'drawer-save', text: 'Salvar', onClick: saveEdit }));
  actions.appendChild(el('button', { className: 'drawer-cancel', text: 'Fechar', onClick: closeDrawer }));
  drawer.appendChild(actions);

  return [overlay, drawer];
}

function openEditDrawer(f) {
  S.editingId = f.id;
  document.getElementById('drawer-link').textContent = f.link;
  document.getElementById('edit-title').value = f.title || '';
  document.getElementById('edit-poster').value = f.poster || '';
  document.getElementById('edit-year').value = f.year || '';
  document.getElementById('edit-duration').value = f.duration || '';
  document.getElementById('edit-genre').value = f.genre || '';
  document.getElementById('edit-rating').value = f.rating || '';
  document.getElementById('edit-age').value = f.age || 'livre';
  document.getElementById('edit-description').value = f.description || '';
  document.getElementById('edit-trending').checked = !!f.trending;
  document.getElementById('drawer-overlay').classList.add('active');
  document.getElementById('drawer').classList.add('active');
}
function closeDrawer() {
  document.getElementById('drawer-overlay').classList.remove('active');
  document.getElementById('drawer').classList.remove('active');
  S.editingId = null;
}

async function saveEdit() {
  if (!S.editingId) return;
  const payload = {
    title: document.getElementById('edit-title').value,
    poster: document.getElementById('edit-poster').value,
    year: document.getElementById('edit-year').value,
    duration: document.getElementById('edit-duration').value,
    genre: document.getElementById('edit-genre').value,
    rating: document.getElementById('edit-rating').value,
    age: document.getElementById('edit-age').value,
    description: document.getElementById('edit-description').value,
    trending: document.getElementById('edit-trending').checked,
  };
  try {
    const res = await api('/api/admin/films/' + S.editingId, { method: 'PUT', body: JSON.stringify(payload) });
    if (res.ok) {
      const data = await res.json();
      const idx = S.films.findIndex(x => x.id === S.editingId);
      if (idx >= 0) S.films[idx] = data.film;
      closeDrawer();
      renderFilms();
    } else if (res.status === 401) handleAuthFail();
  } catch (e) {}
}

async function deleteFilm(id) {
  if (!confirm('Excluir este filme do catálogo?')) return;
  try {
    const res = await api('/api/admin/films/' + id, { method: 'DELETE' });
    if (res.ok) { S.films = S.films.filter(x => x.id !== id); renderFilms(); updateBarsCounter(); }
    else if (res.status === 401) handleAuthFail();
  } catch (e) {}
}

// ═══════════════════════════════════════════════════════════════
// CHATBOT
// ═══════════════════════════════════════════════════════════════
function buildChat() {
  const fab = el('button', { className: 'chat-fab', id: 'chat-fab', 'aria-label': 'Assistente', onClick: toggleChat });
  fab.appendChild(svgEl(I.chat));

  const win = el('div', { className: 'chat-window', id: 'chat-window' });
  const top = el('div', { className: 'chat-top' });
  const av = el('div', { className: 'chat-avatar' }); av.appendChild(svgEl(I.reel));
  const topInfo = el('div', { className: 'chat-top-info' });
  topInfo.appendChild(el('h4', { text: 'NINO' }));
  topInfo.appendChild(el('span', { text: '● Seu guia de filmes' }));
  const topClose = el('button', { className: 'chat-top-close', onClick: toggleChat }); topClose.appendChild(svgEl(I.close));
  top.append(av, topInfo, topClose);
  win.appendChild(top);

  const body = el('div', { className: 'chat-body', id: 'chat-body' });
  win.appendChild(body);

  const sug = el('div', { className: 'chat-suggestions', id: 'chat-suggestions' });
  ['Filme pra hoje à noite', 'Algo pra assistir com crianças', 'Melhores de ação', 'Parecido com Interestelar'].forEach(s => {
    sug.appendChild(el('button', { className: 'chat-sug', text: s, onClick: () => { document.getElementById('chat-field').value = s; sendChat(); } }));
  });
  win.appendChild(sug);

  const row = el('div', { className: 'chat-input-row' });
  const field = el('input', { id: 'chat-field', type: 'text', placeholder: 'Pergunta sobre filmes...' });
  field.addEventListener('keydown', e => { if (e.key === 'Enter') sendChat(); });
  const send = el('button', { className: 'chat-send', id: 'chat-send', onClick: sendChat }); send.appendChild(svgEl(I.send));
  row.append(field, send);
  win.appendChild(row);

  return [fab, win];
}

function toggleChat() {
  const win = document.getElementById('chat-window');
  win.classList.toggle('active');
  if (win.classList.contains('active')) {
    const body = document.getElementById('chat-body');
    if (!body.children.length) addChatMsg('bot', 'E aí! Sou o <strong>NINO</strong>, seu guia de filmes. 🎬 Me diz seu humor, o gênero que curte ou quem vai assistir, que eu recomendo o filme certo.');
    document.getElementById('chat-field').focus();
  }
}

function addChatMsg(role, html) {
  const body = document.getElementById('chat-body');
  const msg = el('div', { className: 'chat-msg ' + role, html });
  body.appendChild(msg);
  body.scrollTop = body.scrollHeight;
  return msg;
}

async function sendChat() {
  const field = document.getElementById('chat-field');
  const text = field.value.trim();
  if (!text) return;
  field.value = '';
  const sug = document.getElementById('chat-suggestions');
  if (sug) sug.style.display = 'none';
  addChatMsg('user', esc(text));
  S.chatHistory.push({ role: 'user', content: text });

  const typing = el('div', { className: 'chat-typing', id: 'chat-typing', html: '<span></span><span></span><span></span>' });
  document.getElementById('chat-body').appendChild(typing);
  document.getElementById('chat-body').scrollTop = 1e9;
  document.getElementById('chat-send').disabled = true;

  try {
    const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: S.chatHistory }) });
    const data = await res.json();
    typing.remove();
    const reply = data.reply || 'Não consegui responder agora.';
    S.chatHistory.push({ role: 'assistant', content: reply });
    addChatMsg('bot', formatChat(reply));
  } catch (e) {
    typing.remove();
    addChatMsg('bot', 'Ops, tive um problema de conexão. Tenta de novo?');
  }
  document.getElementById('chat-send').disabled = false;
  document.getElementById('chat-field').focus();
}

function formatChat(t) {
  t = esc(t);
  t = t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  t = t.replace(/\n/g, '<br>');
  return t;
}

// ═══════════════════════════════════════════════════════════════
// FOOTER
// ═══════════════════════════════════════════════════════════════
function buildFooter() {
  const footer = el('footer', { className: 'footer' });
  const brand = el('div', { className: 'brand' });
  const mark = el('img', { className: 'brand-mark', src: '/static/logo.svg', alt: 'NinoHD' });
  brand.appendChild(mark); brand.appendChild(el('div', { className: 'brand-name', html: 'NINO<span>HD</span>' }));
  footer.appendChild(brand);
  footer.appendChild(el('p', { text: 'Seu cinema, sem limites. Filmes para todos os momentos.' }));
  footer.appendChild(el('p', { style: 'margin-top:6px;opacity:.6;font-size:.72rem', text: `© ${new Date().getFullYear()} NinoHD` }));
  return footer;
}

// ═══════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════
// ANÚNCIOS (Adsterra)
// ═══════════════════════════════════════════════════════════════
//
// COMO USAR:
// 1. Crie conta em adsterra.com e adicione seu site.
// 2. Crie um "Banner" (ex: 728x90 para topo/rodapé, 300x250 para o meio).
// 3. A Adsterra te dá um código. Cole esse código dentro das aspas
//    da variável correspondente abaixo (ADS.topo, ADS.meio, ADS.rodape).
// 4. Salve e publique. O anúncio aparece sozinho.
//
// Enquanto estiver vazio, aparece um espaço discreto "Publicidade"
// que NÃO atrapalha o site.

const ADS = {
  // Banner do TOPO (recomendado: 728x90). Cole o código da Adsterra aqui:
  topo: ``,

  // Banner do MEIO, entre os filmes (recomendado: 300x250). Cole aqui:
  meio: ``,

  // Banner do RODAPÉ (recomendado: 728x90). Cole aqui:
  rodape: ``,
};

function buildAdSlot(code, id) {
  const wrap = el('div', { className: 'ad-slot', id: 'ad-' + id });
  if (code && code.trim()) {
    // Injeta o código do anúncio e executa scripts (Adsterra usa <script>)
    wrap.innerHTML = code;
    wrap.querySelectorAll('script').forEach(old => {
      const s = document.createElement('script');
      [...old.attributes].forEach(a => s.setAttribute(a.name, a.value));
      s.textContent = old.textContent;
      old.replaceWith(s);
    });
  } else {
    // Placeholder discreto enquanto não há código
    wrap.classList.add('ad-empty');
    wrap.appendChild(el('span', { text: 'Publicidade' }));
  }
  return wrap;
}

// INIT
// ═══════════════════════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('ninohd-root');
  document.documentElement.setAttribute('data-theme', S.theme);

  root.appendChild(buildTopbar());
  root.appendChild(buildHero());
  root.appendChild(buildAdSlot(ADS.topo, 'topo'));      // anúncio TOPO
  root.appendChild(buildStats());
  root.appendChild(buildFilters());
  root.appendChild(buildCatalog());
  root.appendChild(buildAdSlot(ADS.meio, 'meio'));      // anúncio MEIO
  root.appendChild(buildAdminPanel());
  root.appendChild(buildAdSlot(ADS.rodape, 'rodape'));  // anúncio RODAPÉ
  root.appendChild(buildFooter());
  root.appendChild(buildPlayerModal());
  root.appendChild(buildLoginModal());
  const [overlay, drawer] = buildDrawer();
  root.append(overlay, drawer);
  const [fab, chatWin] = buildChat();
  root.append(fab, chatWin);

  loadFilms();
});
