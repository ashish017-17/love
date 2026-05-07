/* ═══════════════════════════════════════════════════════
   gallery.js — Premium Cinematic Photo Gallery
   
   HOW TO ADD IMAGES:
   1. Drop any image files (.jpg, .png, .webp) into /gallery folder
   2. Edit GALLERY_ITEMS below with your file details
   3. Assign a category: "behind-the-scenes" | "actors" | "wallpapers" | "trending"
   ═══════════════════════════════════════════════════════ */

'use strict';

/* ═══ GALLERY LIBRARY — Edit this to match your /gallery folder ═══
   
   Format for each item:
   {
     file:     "gallery/yourimage.jpg",   ← relative path
     title:    "Image Display Name",
     category: "actors",                  ← one of the categories below
   }
   
   Categories: "behind-the-scenes" | "actors" | "wallpapers" | "trending"
   ══════════════════════════════════════════════════════════ */
const GALLERY_ITEMS = [
  /* ── EXAMPLE ENTRIES — replace with your actual files ──
  { file: "gallery/bts_01.jpg",      title: "Behind The Magic",  category: "behind-the-scenes" },
  { file: "gallery/bts_02.jpg",      title: "On Set Moments",    category: "behind-the-scenes" },
  { file: "gallery/actor_01.jpg",    title: "Lead Actor",        category: "actors"            },
  { file: "gallery/actor_02.jpg",    title: "Supporting Cast",   category: "actors"            },
  { file: "gallery/wall_01.jpg",     title: "Epic Landscape",    category: "wallpapers"        },
  { file: "gallery/wall_02.jpg",     title: "Dark Cinematic",    category: "wallpapers"        },
  { file: "gallery/poster_01.jpg",   title: "Official Poster",   category: "trending"          },
  { file: "gallery/poster_02.jpg",   title: "Fan Art",           category: "trending"          },
  */
];

/* ═══════════════════════════════════════════════════════
   State
   ═══════════════════════════════════════════════════════ */
const galleryState = {
  currentCategory: 'all',
  currentIndex:    -1,
  filteredItems:   [],
};

/* ═══════════════════════════════════════════════════════
   DOM Refs
   ═══════════════════════════════════════════════════════ */
const galleryGrid    = document.getElementById('galleryGrid');
const galleryEmpty   = document.getElementById('galleryEmpty');
const galleryTabs    = document.getElementById('galleryTabs');
const lightbox       = document.getElementById('galleryLightbox');
const lightboxImg    = document.getElementById('lightboxImg');
const lightboxClose  = document.getElementById('lightboxClose');
const lightboxPrev   = document.getElementById('lightboxPrev');
const lightboxNext   = document.getElementById('lightboxNext');
const lightboxCap    = document.getElementById('lightboxCaption');
const lightboxCount  = document.getElementById('lightboxCounter');
const lightboxOverlay= document.getElementById('lightboxOverlay');
const lightboxContent= lightbox ? lightbox.querySelector('.lightbox-content') : null;

/* ═══════════════════════════════════════════════════════
   Category Labels
   ═══════════════════════════════════════════════════════ */
const CAT_LABELS = {
  'behind-the-scenes': 'Behind The Scenes',
  'actors':            'Actors',
  'wallpapers':        'Wallpapers',
  'trending':          'Trending Posters',
};

/* ═══════════════════════════════════════════════════════
   Render Gallery
   ═══════════════════════════════════════════════════════ */
function renderGallery(category = 'all') {
  if (!galleryGrid) return;
  galleryState.currentCategory = category;

  const items = category === 'all'
    ? GALLERY_ITEMS
    : GALLERY_ITEMS.filter(item => item.category === category);

  galleryState.filteredItems = items;

  galleryGrid.innerHTML = '';

  if (items.length === 0) {
    galleryEmpty.style.display  = 'block';
    galleryGrid.style.display   = 'none';
    return;
  }

  galleryEmpty.style.display = 'none';
  galleryGrid.style.display  = '';

  items.forEach((item, idx) => {
    const el = createGalleryItem(item, idx);
    el.style.animationDelay = `${idx * 0.04}s`;
    galleryGrid.appendChild(el);
  });
}

function createGalleryItem(item, index) {
  const div = document.createElement('div');
  div.className = 'gallery-item';
  div.dataset.index = index;

  const catLabel = CAT_LABELS[item.category] || item.category || '';

  div.innerHTML = `
    <img
      src="${item.file}"
      alt="${item.title}"
      loading="lazy"
      onerror="this.closest('.gallery-item').style.display='none'"
    >
    <div class="gallery-item-overlay">
      <div class="gallery-item-name">${item.title}</div>
      <div class="gallery-item-cat">${catLabel}</div>
    </div>
    <div class="gallery-item-expand"><i class="fas fa-expand-alt"></i></div>
    ${catLabel ? `<div class="gallery-item-badge">${catLabel}</div>` : ''}
  `;

  div.addEventListener('click', () => openLightbox(index));
  return div;
}

/* ═══════════════════════════════════════════════════════
   Lightbox
   ═══════════════════════════════════════════════════════ */
function openLightbox(index) {
  if (!lightbox) return;
  galleryState.currentIndex = index;
  showLightboxImage(index, false);
  lightbox.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  if (!lightbox) return;
  lightbox.classList.add('hidden');
  document.body.style.overflow = '';
  lightboxImg.src = '';
}

function showLightboxImage(index, animate = true) {
  const items = galleryState.filteredItems;
  if (index < 0 || index >= items.length) return;

  const item = items[index];
  galleryState.currentIndex = index;

  if (animate && lightboxContent) {
    lightboxContent.classList.add('transitioning');
    setTimeout(() => lightboxContent.classList.remove('transitioning'), 300);
  }

  lightboxImg.src = item.file;
  lightboxImg.alt = item.title;
  lightboxCap.textContent = item.title + (item.category ? ` · ${CAT_LABELS[item.category] || item.category}` : '');
  lightboxCount.textContent = `${index + 1} / ${items.length}`;

  // Arrow visibility
  lightboxPrev.style.opacity = index === 0 ? '0.3' : '1';
  lightboxNext.style.opacity = index === items.length - 1 ? '0.3' : '1';
}

function lightboxNavigate(dir) {
  const items = galleryState.filteredItems;
  const next  = galleryState.currentIndex + dir;
  if (next < 0 || next >= items.length) return;
  showLightboxImage(next, true);
}

/* ── Lightbox Events ── */
if (lightboxClose)   lightboxClose.addEventListener('click', closeLightbox);
if (lightboxOverlay) lightboxOverlay.addEventListener('click', closeLightbox);
if (lightboxPrev)    lightboxPrev.addEventListener('click', () => lightboxNavigate(-1));
if (lightboxNext)    lightboxNext.addEventListener('click', () => lightboxNavigate(+1));

// Keyboard navigation
document.addEventListener('keydown', e => {
  if (!lightbox || lightbox.classList.contains('hidden')) return;
  if (e.key === 'ArrowLeft')  lightboxNavigate(-1);
  if (e.key === 'ArrowRight') lightboxNavigate(+1);
  if (e.key === 'Escape')     closeLightbox();
});

/* ── Touch/Swipe Support ── */
let touchStartX = 0;
let touchEndX   = 0;

if (lightbox) {
  lightbox.addEventListener('touchstart', e => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', e => {
    touchEndX = e.changedTouches[0].screenX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 50) {
      lightboxNavigate(diff > 0 ? 1 : -1);
    }
  }, { passive: true });
}

/* ═══════════════════════════════════════════════════════
   Category Tab Events
   ═══════════════════════════════════════════════════════ */
if (galleryTabs) {
  galleryTabs.addEventListener('click', e => {
    const btn = e.target.closest('.gallery-tab');
    if (!btn) return;

    // Update active tab
    galleryTabs.querySelectorAll('.gallery-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    // Render filtered gallery
    renderGallery(btn.dataset.cat);
  });
}

/* ═══════════════════════════════════════════════════════
   Init
   ═══════════════════════════════════════════════════════ */
renderGallery('all');

// Export for section navigation
window.renderGallery = renderGallery;
