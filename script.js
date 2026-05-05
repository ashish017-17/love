/* ═══════════════════════════════════════
   NETFLIX CLONE – script.js
   ═══════════════════════════════════════ */

const PROFILES = [
  { name: 'Ashish', color: '#ffffffff', initial: 'A', img: 'images/avatars/alex.jpg' },
  { name: 'Swara', color: '#ffffffff', initial: 'S', img: 'images/avatars/sarah.jpg' },
];

const $ = id => document.getElementById(id);

// ── LOADING SCREEN ──
let loadProgress = 0;
const loadInterval = setInterval(() => {
  loadProgress += Math.random() * 15 + 5;
  if (loadProgress >= 100) loadProgress = 100;
  $('loaderFill').style.width = loadProgress + '%';
  if (loadProgress >= 100) {
    clearInterval(loadInterval);
    setTimeout(() => {
      $('loading-screen').style.opacity = '0';
      setTimeout(() => {
        $('loading-screen').classList.add('hidden');
        $('profile-screen').classList.remove('hidden');
        requestAnimationFrame(() => $('profile-screen').classList.add('show'));
      }, 600);
    }, 400);
  }
}, 200);

// ── PROFILES ──
function renderProfiles() {
  const grid = $('profilesGrid');
  PROFILES.forEach((p, i) => {
    const card = document.createElement('div');
    card.className = 'profile-card';
    const hasImg = p.img && p.img.length > 0;
    card.innerHTML = `
      <div class="avatar-box" style="background:${p.color}">
        ${hasImg ? `<img src="${p.img}" alt="${p.name}" onerror="this.remove();this.parentElement.textContent='${p.initial}'">` : p.initial}
      </div>
      <p>${p.name}</p>`;
    if (p.name !== 'Add Profile') {
      card.onclick = () => selectProfile(p);
    }
    grid.appendChild(card);
  });
}
renderProfiles();

function selectProfile(profile) {
  const avatar = $('navAvatar');
  if (profile.img) {
    avatar.innerHTML = `<img src="${profile.img}" alt="${profile.name}" onerror="this.remove();this.parentElement.textContent='${profile.initial}'">`;
  } else {
    avatar.textContent = profile.initial;
    avatar.style.background = profile.color;
    avatar.style.display = 'flex';
    avatar.style.alignItems = 'center';
    avatar.style.justifyContent = 'center';
    avatar.style.fontWeight = '700';
  }
  $('profile-screen').classList.remove('show');
  setTimeout(() => {
    $('profile-screen').classList.add('hidden');
    $('app').classList.remove('hidden');
    $('app').style.animation = 'fadeIn .6s ease-out';
    tryPlayAudio();
  }, 500);
}

// ── HOVER PREVIEW: play video on card hover ──
document.querySelectorAll('.movie-card').forEach(card => {
  const vid = card.querySelector('.card-video');
  if (!vid) return;
  card.addEventListener('mouseenter', () => { vid.muted = true; vid.currentTime = 0; vid.play().catch(() => {}); });
  card.addEventListener('mouseleave', () => { vid.pause(); vid.currentTime = 0; });
});

// ── VIDEO MODAL ──
function openVideo(src, title) {
  const modal = $('videoModal');
  const player = $('videoPlayer');
  modal.classList.remove('hidden');
  player.src = src;
  player.muted = true;
  $('modalTitle').textContent = title || '';
  player.play().catch(() => {});
  $('bgAudio').pause();
}

$('modalClose').onclick = closeVideo;
$('videoModal').onclick = function(e) { if (e.target === this) closeVideo(); };

function closeVideo() {
  $('videoPlayer').pause();
  $('videoPlayer').src = '';
  $('videoModal').classList.add('hidden');
  if (!audioMuted) tryPlayAudio();
}

// ── NAVBAR SCROLL ──
window.addEventListener('scroll', () => {
  $('navbar').classList.toggle('scrolled', window.scrollY > 50);
});

// ── HAMBURGER ──
$('hamburger').onclick = () => {
  $('hamburger').classList.toggle('open');
  $('mobileMenu').classList.toggle('hidden');
};

// ── AUDIO ──
let audioMuted = false;
function tryPlayAudio() {
  const audio = $('bgAudio');
  audio.volume = 0.15;
  audio.play().catch(() => {});
}

$('audioBtn').onclick = () => {
  const audio = $('bgAudio');
  audioMuted = !audioMuted;
  if (audioMuted) {
    audio.pause();
    $('audioIcon').className = 'fas fa-volume-mute';
  } else {
    tryPlayAudio();
    $('audioIcon').className = 'fas fa-volume-up';
  }
};

// ── KEYBOARD ──
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeVideo();
});