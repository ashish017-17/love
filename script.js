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

// ── HOVER PREVIEW ──
// Disabled: Videos now autoplay directly via HTML attribute.

// ── VIDEO MODAL & CUSTOM CONTROLS ──
const video = $('videoPlayer');
const videoContainer = $('videoContainer');
const videoControls = $('videoControls');
const playPauseBtn = $('playPauseBtn');
const playIcon = $('playIcon');
const rewindBtn = $('rewindBtn');
const forwardBtn = $('forwardBtn');
const volBtn = $('volBtn');
const volIcon = $('volIcon');
const volumeSlider = $('volumeSlider');
const currentTimeEl = $('currentTime');
const durationTimeEl = $('durationTime');
const progressContainer = $('progressContainer');
const progressBar = $('progressBar');
const progressHoverTime = $('progressHoverTime');
const fullscreenBtn = $('fullscreenBtn');
const fullScreenIcon = $('fullScreenIcon');

let hideControlsTimeout;

function openVideo(src, title) {
  $('videoModal').classList.remove('hidden');
  video.src = src;
  video.muted = false; // Netflix plays sound
  volumeSlider.value = 1;
  volIcon.className = 'fas fa-volume-up';
  
  $('modalTitle').textContent = title || '';
  video.play().then(() => updatePlayIcon()).catch(() => {});
  
  $('bgAudio').pause();
  resetHideControlsTimer();
}

function closeVideo() {
  video.pause();
  video.src = '';
  $('videoModal').classList.add('hidden');
  if (!audioMuted) tryPlayAudio();
  clearTimeout(hideControlsTimeout);
}

$('modalClose').onclick = closeVideo;
$('videoModal').onclick = function(e) { if (e.target === this) closeVideo(); };

// Dynamically handle movie card clicks to use their exact title and video src
document.querySelectorAll('.movie-card').forEach(card => {
  card.onclick = function(e) {
    // If it's a hero button or something else with its own click, let it be.
    // But for movie cards, override with dynamic data.
    const sourceEl = this.querySelector('source');
    const titleEl = this.querySelector('.card-title');
    if (sourceEl && titleEl) {
      openVideo(sourceEl.src, titleEl.textContent);
    }
  };
});

// Toggle Play/Pause
function togglePlay() {
  if (video.paused) video.play();
  else video.pause();
  updatePlayIcon();
}

function updatePlayIcon() {
  playIcon.className = video.paused ? 'fas fa-play' : 'fas fa-pause';
}

playPauseBtn.onclick = togglePlay;
video.onclick = togglePlay;

// Skip Forward/Back
rewindBtn.onclick = () => { video.currentTime -= 10; };
forwardBtn.onclick = () => { video.currentTime += 10; };

// Volume Control
function toggleMute() {
  video.muted = !video.muted;
  if(video.muted) {
    volumeSlider.value = 0;
    volIcon.className = 'fas fa-volume-mute';
  } else {
    volumeSlider.value = video.volume || 1;
    volIcon.className = 'fas fa-volume-up';
  }
}
volBtn.onclick = toggleMute;

volumeSlider.addEventListener('input', (e) => {
  video.volume = e.target.value;
  video.muted = e.target.value === '0';
  if(video.muted) volIcon.className = 'fas fa-volume-mute';
  else if (video.volume < 0.5) volIcon.className = 'fas fa-volume-down';
  else volIcon.className = 'fas fa-volume-up';
});

// Format time
function formatTime(time) {
  if(isNaN(time)) return "0:00";
  const minutes = Math.floor(time / 60);
  let seconds = Math.floor(time % 60);
  if (seconds < 10) seconds = `0${seconds}`;
  return `${minutes}:${seconds}`;
}

// Update Progress Bar
video.addEventListener('timeupdate', () => {
  currentTimeEl.textContent = formatTime(video.currentTime);
  const progressPercent = (video.currentTime / video.duration) * 100;
  progressBar.style.width = `${progressPercent}%`;
});

video.addEventListener('loadedmetadata', () => {
  durationTimeEl.textContent = formatTime(video.duration);
});

// Click to Seek
progressContainer.addEventListener('click', (e) => {
  const rect = progressContainer.getBoundingClientRect();
  const pos = (e.clientX - rect.left) / rect.width;
  video.currentTime = pos * video.duration;
});

// Hover Time on Progress Bar
progressContainer.addEventListener('mousemove', (e) => {
  const rect = progressContainer.getBoundingClientRect();
  const pos = (e.clientX - rect.left) / rect.width;
  const hoverTime = pos * video.duration;
  progressHoverTime.textContent = formatTime(hoverTime);
  progressHoverTime.style.left = `${pos * 100}%`;
});

// Fullscreen
fullscreenBtn.onclick = () => {
  if (!document.fullscreenElement) {
    videoContainer.requestFullscreen().catch(err => console.log(err));
  } else {
    document.exitFullscreen();
  }
};

document.addEventListener('fullscreenchange', () => {
  if (document.fullscreenElement) fullScreenIcon.className = 'fas fa-compress';
  else fullScreenIcon.className = 'fas fa-expand';
});

// Auto-hide controls
function resetHideControlsTimer() {
  videoControls.classList.remove('hidden-controls');
  videoContainer.style.cursor = 'default';
  clearTimeout(hideControlsTimeout);
  
  if(!video.paused) {
    hideControlsTimeout = setTimeout(() => {
      videoControls.classList.add('hidden-controls');
      videoContainer.style.cursor = 'none';
    }, 3000);
  }
}

videoContainer.addEventListener('mousemove', resetHideControlsTimer);
videoContainer.addEventListener('click', resetHideControlsTimer);
video.addEventListener('pause', resetHideControlsTimer);
video.addEventListener('play', resetHideControlsTimer);

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