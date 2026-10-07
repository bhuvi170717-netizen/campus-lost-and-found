/**
 * MAIN APPLICATION ORCHESTRATOR
 * State management, Feed rendering, Filters, Search & Event bus
 */

import { storage } from './storage.js';
import { campusMap } from './map.js';
import { modals } from './modal.js';
import { REVA_LANDMARKS } from './mock-data.js';
import {
  formatRelativeTime,
  maskPhoneNumber,
  cleanPhoneForWhatsApp,
  escapeHtml,
  CATEGORY_MAP,
  playHapticSound
} from './utils.js';

class CampusLostAndFoundApp {
  constructor() {
    this.filters = {
      type: 'all', // 'all' | 'lost' | 'found'
      category: 'all',
      landmark: 'all',
      query: '',
      sort: 'newest'
    };

    this.revealedContacts = new Set();
    this.viewMode = 'split'; // 'split' | 'feed' | 'map'
  }

  init() {
    // Expose global modal triggers for inline HTML callbacks
    window.triggerClaimModal = (id) => modals.openClaimModal(id);
    window.scrollToItemCard = (id) => this.scrollToCard(id);
    window.focusMapItem = (id) => this.focusMapItem(id);

    // Initialize Map
    campusMap.init((item) => {
      this.scrollToCard(item.id);
    });

    this.bindEvents();
    this.renderLandmarkFilterChips();
    this.renderCategoryChips();
    this.refreshUI();
  }

  bindEvents() {
    // Listen for storage updates
    window.addEventListener('items-updated', () => {
      this.refreshUI();
    });

    // Listen for Firebase status changes
    window.addEventListener('firebase-status-changed', (e) => {
      const { isLive, projectId } = e.detail;
      const badgeText = document.getElementById('headerSyncBadgeText');
      const badge = document.getElementById('headerSyncBadge');
      if (badge && badgeText) {
        if (isLive) {
          badgeText.textContent = `Firestore: ${projectId}`;
          badge.style.borderColor = 'rgba(48, 209, 88, 0.4)';
          badge.style.color = '#30D158';
        } else {
          badgeText.textContent = 'Local Mode';
          badge.style.borderColor = 'rgba(255, 159, 10, 0.4)';
          badge.style.color = '#FF9F0A';
        }
      }
    });

    // Header sync badge click opens Settings
    const syncBadgeBtn = document.getElementById('headerSyncBadge');
    if (syncBadgeBtn) {
      syncBadgeBtn.addEventListener('click', () => {
        modals.openSettingsModal();
      });
    }

    // Search bar input
    const searchInput = document.getElementById('itemSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filters.query = e.target.value.toLowerCase().trim();
        this.renderFeed();
      });
    }

    // Keyboard shortcut (⌘K or / to search)
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey && e.key === 'k') || (e.ctrlKey && e.key === 'k') || (e.key === '/' && document.activeElement !== searchInput)) {
        if (searchInput) {
          e.preventDefault();
          searchInput.focus();
          searchInput.select();
        }
      }
    });

    // Segmented Type Filters (All, Lost, Found)
    document.querySelectorAll('.segment-btn[data-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.segment-btn[data-type]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filters.type = btn.dataset.type;
        playHapticSound('click');
        this.refreshUI();
      });
    });

    // Sort selector
    const sortSelect = document.getElementById('sortBySelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.filters.sort = e.target.value;
        this.renderFeed();
      });
    }

    // View mode switchers (Split, Feed, Map)
    document.querySelectorAll('.view-btn[data-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn[data-view]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.setViewMode(btn.dataset.view);
        playHapticSound('click');
      });
    });

    // Reset campus map center button
    const resetMapBtn = document.getElementById('resetMapCenterBtn');
    if (resetMapBtn) {
      resetMapBtn.addEventListener('click', () => {
        campusMap.resetCampusView();
        playHapticSound('click');
      });
    }

    // Navbar scroll effect
    window.addEventListener('scroll', () => {
      const header = document.querySelector('.app-header');
      if (header) {
        if (window.scrollY > 20) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    });
  }

  renderLandmarkFilterChips() {
    const container = document.getElementById('landmarkFilterChips');
    if (!container) return;

    container.innerHTML = '';
    REVA_LANDMARKS.forEach(lm => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `landmark-chip ${this.filters.landmark === lm.id ? 'active' : ''}`;
      chip.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>${escapeHtml(lm.name)}</span>
      `;
      chip.addEventListener('click', () => {
        container.querySelectorAll('.landmark-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.filters.landmark = lm.id;
        playHapticSound('click');

        if (lm.id !== 'all') {
          campusMap.focusLandmark(lm.id);
        } else {
          campusMap.resetCampusView();
        }
        this.renderFeed();
      });
      container.appendChild(chip);
    });
  }

  renderCategoryChips() {
    const container = document.getElementById('categoryChipsBar');
    if (!container) return;

    container.innerHTML = `
      <button type="button" class="category-chip active" data-cat="all">
        <span>All Categories</span>
      </button>
    `;

    Object.entries(CATEGORY_MAP).forEach(([key, info]) => {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'category-chip';
      chip.dataset.cat = key;
      chip.innerHTML = `<span>${escapeHtml(info.label)}</span>`;
      chip.addEventListener('click', () => {
        container.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.filters.category = key;
        playHapticSound('click');
        this.renderFeed();
      });
      container.appendChild(chip);
    });

    container.querySelector('[data-cat="all"]').addEventListener('click', (e) => {
      container.querySelectorAll('.category-chip').forEach(c => c.classList.remove('active'));
      e.currentTarget.classList.add('active');
      this.filters.category = 'all';
      playHapticSound('click');
      this.renderFeed();
    });
  }

  setViewMode(mode) {
    this.viewMode = mode;
    const mapSection = document.querySelector('.campus-map-section');
    const feedSection = document.querySelector('.items-grid-section');

    if (mode === 'feed') {
      if (mapSection) mapSection.style.display = 'none';
      if (feedSection) feedSection.style.display = 'block';
    } else if (mode === 'map') {
      if (mapSection) {
        mapSection.style.display = 'block';
        const mapWrap = mapSection.querySelector('.map-wrapper');
        if (mapWrap) mapWrap.style.height = '620px';
        campusMap.map?.invalidateSize();
      }
      if (feedSection) feedSection.style.display = 'none';
    } else {
      // Split view
      if (mapSection) {
        mapSection.style.display = 'block';
        const mapWrap = mapSection.querySelector('.map-wrapper');
        if (mapWrap) mapWrap.style.height = '380px';
        campusMap.map?.invalidateSize();
      }
      if (feedSection) feedSection.style.display = 'block';
    }
  }

  getFilteredItems() {
    let items = storage.getItems();

    // Filter by Type (All / Lost / Found)
    if (this.filters.type !== 'all') {
      items = items.filter(it => it.type === this.filters.type);
    }

    // Filter by Category
    if (this.filters.category !== 'all') {
      items = items.filter(it => it.category === this.filters.category);
    }

    // Filter by Landmark
    if (this.filters.landmark !== 'all') {
      const selectedLm = REVA_LANDMARKS.find(l => l.id === this.filters.landmark);
      if (selectedLm) {
        items = items.filter(it => it.landmark.toLowerCase().includes(selectedLm.name.toLowerCase()));
      }
    }

    // Filter by Search Query
    if (this.filters.query) {
      const q = this.filters.query;
      items = items.filter(it =>
        it.title.toLowerCase().includes(q) ||
        it.description.toLowerCase().includes(q) ||
        it.landmark.toLowerCase().includes(q) ||
        it.locationDetail.toLowerCase().includes(q) ||
        (it.reporterName && it.reporterName.toLowerCase().includes(q))
      );
    }

    // Sort
    items.sort((a, b) => {
      const timeA = new Date(a.dateReported).getTime();
      const timeB = new Date(b.dateReported).getTime();
      return this.filters.sort === 'oldest' ? timeA - timeB : timeB - timeA;
    });

    return items;
  }

  refreshUI() {
    this.updateStats();
    this.renderFeed();
  }

  updateStats() {
    const allItems = storage.getItems();
    const reunitedCount = allItems.filter(i => i.status === 'reunited').length;
    const activeLost = allItems.filter(i => i.type === 'lost' && i.status === 'active').length;
    const activeFound = allItems.filter(i => i.type === 'found' && i.status === 'active').length;
    const totalActive = activeLost + activeFound;

    // Header ticker updates
    const tickerReunited = document.getElementById('tickerReunited');
    const tickerActive = document.getElementById('tickerActive');
    if (tickerReunited) tickerReunited.textContent = reunitedCount;
    if (tickerActive) tickerActive.textContent = totalActive;

    // Hero stats
    const heroReunited = document.getElementById('heroStatReunited');
    const heroLost = document.getElementById('heroStatLost');
    const heroFound = document.getElementById('heroStatFound');
    if (heroReunited) heroReunited.textContent = reunitedCount;
    if (heroLost) heroLost.textContent = activeLost;
    if (heroFound) heroFound.textContent = activeFound;

    // Filter counts
    const countAll = document.getElementById('countAllItems');
    const countLost = document.getElementById('countLostItems');
    const countFound = document.getElementById('countFoundItems');
    if (countAll) countAll.textContent = allItems.length;
    if (countLost) countLost.textContent = allItems.filter(i => i.type === 'lost').length;
    if (countFound) countFound.textContent = allItems.filter(i => i.type === 'found').length;
  }

  renderFeed() {
    const items = this.getFilteredItems();
    const grid = document.getElementById('itemsGrid');
    const countEl = document.getElementById('resultsCountSpan');

    if (countEl) {
      countEl.innerHTML = `Showing <strong>${items.length}</strong> items`;
    }

    // Update markers on the map
    campusMap.updateItemMarkers(items);

    if (!grid) return;

    if (items.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          </div>
          <h3 class="empty-state-title">No items found</h3>
          <p class="empty-state-desc">Try clearing your search terms or filter selections to view all campus reports.</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = '';
    items.forEach(item => {
      const card = this.createItemCard(item);
      grid.appendChild(card);
    });
  }

  createItemCard(item) {
    const card = document.createElement('article');
    card.className = 'item-card';
    card.id = `card-${item.id}`;

    const isLost = item.type === 'lost';
    const isReunited = item.status === 'reunited';
    const statusClass = isReunited ? 'reunited' : (isLost ? 'lost' : 'found');
    const statusText = isReunited ? 'REUNITED' : (isLost ? 'LOST' : 'FOUND');

    const catMeta = CATEGORY_MAP[item.category] || { label: item.category };
    const isRevealed = this.revealedContacts.has(item.id);

    const contactDisplay = isRevealed
      ? `<span style="color: #30D158; font-weight: 600;">${escapeHtml(item.reporterPhone)}</span>`
      : maskPhoneNumber(item.reporterPhone);

    const cleanPhone = cleanPhoneForWhatsApp(item.reporterPhone);

    card.innerHTML = `
      <div class="card-media-wrap">
        <img
          src="${escapeHtml(item.image)}"
          alt="${escapeHtml(item.title)}"
          class="card-img"
          loading="lazy"
          onerror="this.src='https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80'"
        />
        <div class="card-media-gradient"></div>
        <div class="card-badge-container">
          <span class="status-pill ${statusClass}">
            <span class="status-pulse-dot"></span>
            ${statusText}
          </span>
          <span class="category-badge-chip">
            ${escapeHtml(catMeta.label)}
          </span>
        </div>
      </div>

      <div class="card-content">
        <h3 class="card-title">${escapeHtml(item.title)}</h3>
        <p class="card-description">${escapeHtml(item.description)}</p>

        <div class="card-meta-list">
          <div class="card-meta-item location">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            <span>${escapeHtml(item.landmark)} &bull; ${escapeHtml(item.locationDetail)}</span>
          </div>
          <div class="card-meta-item time">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <span>Reported ${formatRelativeTime(item.dateReported)}</span>
          </div>
        </div>

        <div class="card-contact-box">
          <div class="contact-info-col">
            <span class="contact-reporter-name">${escapeHtml(item.reporterName)} <span style="font-size: 11px; opacity: 0.6;">(${escapeHtml(item.reporterSrn || 'Student')})</span></span>
            <span class="contact-phone-masked" id="phone-${item.id}">${contactDisplay}</span>
          </div>
          <button
            type="button"
            class="btn-reveal-contact ${isRevealed ? 'revealed' : ''}"
            id="reveal-btn-${item.id}"
            title="Click to reveal full contact details"
          >
            ${isRevealed ? 'Revealed' : 'Reveal Info'}
          </button>
        </div>

        <div class="card-actions-row">
          <button
            type="button"
            class="btn-action-primary claim-btn"
            onclick="window.triggerClaimModal('${item.id}')"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
            ${isReunited ? 'Resolved' : (isLost ? 'I Found This' : 'Claim Ownership')}
          </button>

          <button
            type="button"
            class="btn-action-pin"
            title="Locate on Campus Map"
            onclick="window.focusMapItem('${item.id}')"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
          </button>

          ${isRevealed ? `
            <a
              href="https://wa.me/${cleanPhone}?text=${encodeURIComponent(`Hi ${item.reporterName}, regarding "${item.title}" on REVA Lost & Found portal`)}"
              target="_blank"
              class="btn-action-pin"
              style="color: #25D366; border-color: rgba(37,211,102,0.4);"
              title="Message on WhatsApp"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
            </a>
          ` : ''}
        </div>
      </div>
    `;

    // Hook up reveal button
    const revealBtn = card.querySelector(`#reveal-btn-${item.id}`);
    if (revealBtn) {
      revealBtn.addEventListener('click', () => {
        this.revealedContacts.add(item.id);
        playHapticSound('click');
        this.renderFeed();
      });
    }

    return card;
  }

  scrollToCard(itemId) {
    const card = document.getElementById(`card-${itemId}`);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.style.transition = 'box-shadow 0.4s ease, transform 0.4s ease';
      card.style.transform = 'translateY(-6px) scale(1.02)';
      card.style.boxShadow = '0 0 35px rgba(10, 132, 255, 0.6)';
      setTimeout(() => {
        card.style.transform = '';
        card.style.boxShadow = '';
      }, 1500);
    }
  }

  focusMapItem(itemId) {
    // If map is hidden, reveal it
    const mapSection = document.querySelector('.campus-map-section');
    if (mapSection && mapSection.style.display === 'none') {
      this.setViewMode('split');
    }
    mapSection?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    campusMap.focusItem(itemId);
  }
}

// Bootstrap application on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  const app = new CampusLostAndFoundApp();
  app.init();
});
