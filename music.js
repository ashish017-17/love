/* ═══════════════════════════════════════════════════════
   music.js — Premium Music Player
   
   HOW TO ADD SONGS:
   1. Drop .mp3 files into /music folder
   2. Drop matching album art into /images/music
      Name them the same as the mp3 (e.g., song.mp3 → song.jpg)
   3. Edit MUSIC_LIBRARY below with your file details
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ═══ MUSIC LIBRARY — Edit this to match your /music folder ═══
   
   Format for each track:
   {
     title:   "Song Display Name",
     artist:  "Artist Name",
     file:    "music/yourfile.mp3",       ← relative path
     cover:   "images/music/yourart.jpg", ← relative path (optional)
     featured: true,                      ← shows in Featured row
     love:     true,                      ← shows in Love Songs row
   }
   
   If you have no cover image, the fallback music icon shows.
   ══════════════════════════════════════════════════════════ */
const MUSIC_LIBRARY = [
  /* ── EXAMPLE ENTRIES — replace with your actual files ──
  {
    title:    "Tum Hi Ho",
    artist:   "Arijit Singh",
    file:     "music/tum_hi_ho.mp3",
    cover:    "images/music/tum_hi_ho.jpg",
    featured: true,
    love:     true,
  },
  {
    title:    "Kesariya",
    artist:   "Arijit Singh",
    file:     "music/kesariya.mp3",
    cover:    "images/music/kesariya.jpg",
    featured: true,
    love:     false,
  },
  {
    title:    "Tera Ban Jaunga",
    artist:   "Akhil Sachdeva",
    file:     "music/tera_ban_jaunga.mp3",
    cover:    "images/music/tera_ban_jaunga.jpg",
    featured: false,
    love:     true,
  },
  */
];

/* ═══════════════════════════════════════════════════════
   Internal State
   ═══════════════════════════════════════════════════════ */
const musicState = {
  currentIndex: -1,
  isPlaying: false,
  audio: new Audio(),
  playlist: [...MUSIC_LIBRARY],
};

/* ═══════════════════════════════════════════════════════
   DOM References
   ═══════════════════════════════════════════════════════ */
const $ = id => document.getElementById(id);

const playerEl        = $('musicPlayer');
const playerArtImg    = $('playerArtImg');
const playerArtFall   = $('playerArtFallback');
const playerSong      = $('playerSong');
const playerArtist    = $('playerArtist');
const playerPlayIcon  = $('playerPlayIcon');
const playerPlayPause = $('playerPlayPause');
const playerPrev      = $('playerPrev');
const playerNext      = $('playerNext');
const playerCurTime   = $('playerCurTime');
const playerDurTime   = $('playerDurTime');
const playerFill      = $('playerProgressFill');
const playerBar       = $('playerProgressBar');
const playerVolBtn    = $('playerVolBtn');
const playerVolIcon   = $('playerVolIcon');
const playerVolSlider = $('playerVolSlider');
const eqBars          = $('eqBars');

/* ═══════════════════════════════════════════════════════
   Render Music Cards
   ═══════════════════════════════════════════════════════ */
function renderMusicSection() {
  const playlist = musicState.playlist;

  if (playlist.length === 0) {
    $('musicEmpty').style.display = 'block';
    $('musicRowFeatured').style.display = 'none';
    $('musicRowLove').style.display = 'none';
    $('musicRowAll').style.display = 'none';
    return;
  }

  $('musicEmpty').style.display = 'none';

  const featured  = playlist.filter(t => t.featured);
  const love      = playlist.filter(t => t.love);
  const all       = playlist;

  renderMusicRow('sliderFeatured', 'featuredCount', featured, 'Featured');
  renderMusicRow('sliderLove',     'loveCount',     love,     'Love');
  renderMusicRow('sliderAll',      'allCount',      all,      'All');

  // Hide empty rows
  $('musicRowFeatured').style.display = featured.length > 0 ? '' : 'none';
  $('musicRowLove').style.display     = love.length > 0     ? '' : 'none';
}

function renderMusicRow(sliderId, countId, tracks, rowLabel) {
  const slider = $(sliderId);
  const countEl = $(countId);
  if (!slider) return;

  slider.innerHTML = '';
  if (countEl) countEl.textContent = tracks.length ? `${tracks.length} songs` : '';

  tracks.forEach((track, localIdx) => {
    // Map local index back to global playlist index
    const globalIdx = musicState.playlist.indexOf(track);
    const card = createMusicCard(track, globalIdx);
    // stagger animation
    card.style.animationDelay = `${localIdx * 0.06}s`;
    slider.appendChild(card);
  });
}

function createMusicCard(track, index) {
  const card = document.createElement('div');
  card.className = 'music-card';
  card.dataset.index = index;

  const hasCover = track.cover && track.cover.length > 0;

  card.innerHTML = `
    <div class="music-card-art">
      ${hasCover
        ? `<img src="${track.cover}" alt="${track.title}" loading="lazy" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
        : ''}
      <div class="music-card-art-fallback" style="${hasCover ? 'display:none' : ''}">
        <i class="fas fa-music"></i>
      </div>
      <div class="music-card-overlay">
        <button class="music-card-play-btn" aria-label="Play ${track.title}">
          <i class="fas fa-play" style="margin-left:3px"></i>
        </button>
      </div>
      <span class="music-card-playing-badge">▶ NOW PLAYING</span>
    </div>
    <div class="music-card-info">
      <div class="music-card-title">${track.title}</div>
      <div class="music-card-artist">${track.artist}</div>
    </div>
  `;

  card.addEventListener('click', () => playSong(index));
  return card;
}

/* ═══════════════════════════════════════════════════════
   Playback Controls
   ═══════════════════════════════════════════════════════ */
function playSong(index) {
  if (index < 0 || index >= musicState.playlist.length) return;

  const track = musicState.playlist[index];
  musicState.currentIndex = index;

  // Update audio source
  musicState.audio.pause();
  musicState.audio.src = track.file;
  musicState.audio.volume = parseFloat(playerVolSlider.value);
  musicState.audio.play().then(() => {
    musicState.isPlaying = true;
    updatePlayerUI(track);
    updateCardStates(index);
    showMusicPlayer();
  }).catch(err => {
    console.warn('Music playback error:', err);
  });
}

function togglePlayPause() {
  if (musicState.currentIndex < 0 && musicState.playlist.length > 0) {
    playSong(0);
    return;
  }
  if (musicState.audio.paused) {
    musicState.audio.play();
    musicState.isPlaying = true;
  } else {
    musicState.audio.pause();
    musicState.isPlaying = false;
  }
  updatePlayPauseIcon();
  updateEqualizer();
}

function playNext() {
  const len = musicState.playlist.length;
  if (len === 0) return;
  const next = (musicState.currentIndex + 1) % len;
  playSong(next);
}

function playPrev() {
  const len = musicState.playlist.length;
  if (len === 0) return;
  // If more than 3s in, restart current song; else go to previous
  if (musicState.audio.currentTime > 3) {
    musicState.audio.currentTime = 0;
    return;
  }
  const prev = (musicState.currentIndex - 1 + len) % len;
  playSong(prev);
}

/* ═══════════════════════════════════════════════════════
   UI Updates
   ═══════════════════════════════════════════════════════ */
function updatePlayerUI(track) {
  playerSong.textContent   = track.title;
  playerArtist.textContent = track.artist;

  if (track.cover) {
    playerArtImg.src = track.cover;
    playerArtImg.style.display = 'block';
    playerArtFall.style.display = 'none';
  } else {
    playerArtImg.style.display = 'none';
    playerArtFall.style.display = 'flex';
  }

  updatePlayPauseIcon();
  updateEqualizer();
}

function updatePlayPauseIcon() {
  if (musicState.isPlaying && !musicState.audio.paused) {
    playerPlayIcon.className = 'fas fa-pause';
    playerEl.classList.add('is-playing');
  } else {
    playerPlayIcon.className = 'fas fa-play';
    playerEl.classList.remove('is-playing');
  }
}

function updateEqualizer() {
  if (musicState.isPlaying && !musicState.audio.paused) {
    playerEl.classList.add('is-playing');
  } else {
    playerEl.classList.remove('is-playing');
  }
}

function showMusicPlayer() {
  playerEl.classList.remove('hidden');
  // Allow transition
  requestAnimationFrame(() => {
    playerEl.classList.add('visible');
  });
  // Push content up so player bar doesn't cover content
  document.body.style.paddingBottom = '80px';
}

function updateCardStates(activeIndex) {
  // Remove playing state from all cards
  document.querySelectorAll('.music-card').forEach(card => {
    card.classList.remove('is-playing');
    const btn = card.querySelector('.music-card-play-btn i');
    if (btn) btn.className = 'fas fa-play';
    btn && (btn.parentElement.parentElement.style.opacity = '');
  });

  // Set playing state on active cards (may appear in multiple rows)
  document.querySelectorAll(`.music-card[data-index="${activeIndex}"]`).forEach(card => {
    card.classList.add('is-playing');
    const btn = card.querySelector('.music-card-play-btn i');
    if (btn) btn.className = 'fas fa-pause';
  });
}

/* ═══════════════════════════════════════════════════════
   Progress & Time
   ═══════════════════════════════════════════════════════ */
musicState.audio.addEventListener('timeupdate', () => {
  const cur = musicState.audio.currentTime;
  const dur = musicState.audio.duration || 0;
  if (!dur) return;

  const pct = (cur / dur) * 100;
  playerFill.style.width = pct + '%';
  playerCurTime.textContent = formatMusicTime(cur);
});

musicState.audio.addEventListener('loadedmetadata', () => {
  playerDurTime.textContent = formatMusicTime(musicState.audio.duration);
});

musicState.audio.addEventListener('ended', () => {
  // Auto-advance to next song
  playNext();
});

musicState.audio.addEventListener('pause', () => {
  musicState.isPlaying = false;
  updatePlayPauseIcon();
});

musicState.audio.addEventListener('play', () => {
  musicState.isPlaying = true;
  updatePlayPauseIcon();
});

function formatMusicTime(seconds) {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

// Seek by clicking progress bar
playerBar.addEventListener('click', e => {
  const rect = playerBar.getBoundingClientRect();
  const pos  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  if (musicState.audio.duration) {
    musicState.audio.currentTime = pos * musicState.audio.duration;
  }
});

// Drag seek
let isDraggingProgress = false;
playerBar.addEventListener('mousedown', e => {
  isDraggingProgress = true;
  seekFromEvent(e);
});
document.addEventListener('mousemove', e => {
  if (isDraggingProgress) seekFromEvent(e);
});
document.addEventListener('mouseup', () => { isDraggingProgress = false; });

// Touch drag seek (mobile)
playerBar.addEventListener('touchstart', e => { isDraggingProgress = true; seekFromTouch(e); }, { passive: true });
document.addEventListener('touchmove', e => { if (isDraggingProgress) seekFromTouch(e); }, { passive: true });
document.addEventListener('touchend', () => { isDraggingProgress = false; });

function seekFromEvent(e) {
  const rect = playerBar.getBoundingClientRect();
  const pos  = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  if (musicState.audio.duration) {
    musicState.audio.currentTime = pos * musicState.audio.duration;
  }
}

function seekFromTouch(e) {
  const touch = e.touches[0];
  const rect  = playerBar.getBoundingClientRect();
  const pos   = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
  if (musicState.audio.duration) {
    musicState.audio.currentTime = pos * musicState.audio.duration;
  }
}

/* ═══════════════════════════════════════════════════════
   Volume Control
   ═══════════════════════════════════════════════════════ */
playerVolSlider.addEventListener('input', e => {
  const vol = parseFloat(e.target.value);
  musicState.audio.volume = vol;
  musicState.audio.muted  = vol === 0;
  updateVolIcon(vol);
});

playerVolBtn.addEventListener('click', () => {
  musicState.audio.muted = !musicState.audio.muted;
  if (musicState.audio.muted) {
    playerVolSlider.value = 0;
    updateVolIcon(0);
  } else {
    const vol = musicState.audio.volume || 0.8;
    playerVolSlider.value = vol;
    updateVolIcon(vol);
  }
});

function updateVolIcon(vol) {
  if (vol === 0) playerVolIcon.className = 'fas fa-volume-mute';
  else if (vol < 0.5) playerVolIcon.className = 'fas fa-volume-down';
  else playerVolIcon.className = 'fas fa-volume-up';
}

/* ═══════════════════════════════════════════════════════
   Button Events
   ═══════════════════════════════════════════════════════ */
playerPlayPause.addEventListener('click', togglePlayPause);
playerPrev.addEventListener('click', playPrev);
playerNext.addEventListener('click', playNext);

/* ═══════════════════════════════════════════════════════
   Keyboard Shortcuts (when music section is visible)
   ═══════════════════════════════════════════════════════ */
document.addEventListener('keydown', e => {
  const musicVisible = !document.getElementById('music-section').classList.contains('hidden');
  if (!musicVisible && musicState.currentIndex < 0) return;

  if (e.code === 'Space' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'BUTTON') {
    e.preventDefault();
    togglePlayPause();
  }
  if (e.code === 'ArrowRight' && e.altKey) { e.preventDefault(); playNext(); }
  if (e.code === 'ArrowLeft'  && e.altKey) { e.preventDefault(); playPrev(); }
});

/* ═══════════════════════════════════════════════════════
   Init
   ═══════════════════════════════════════════════════════ */
renderMusicSection();

// Export for section navigation (used by script.js)
window.renderMusicSection = renderMusicSection;
