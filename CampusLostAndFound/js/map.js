/**
 * LEAFLET CAMPUS MAP ENGINE
 * Custom Apple Dark Theme, Animated Custom Pins, Popups & Landmark Nav
 */

import { REVA_CAMPUS_CENTER, REVA_LANDMARKS } from './mock-data.js';
import { escapeHtml, formatRelativeTime } from './utils.js';

export class CampusMapEngine {
  constructor(containerId = 'revaCampusMap') {
    this.containerId = containerId;
    this.map = null;
    this.markerLayer = null;
    this.landmarkLayer = null;
    this.markersMap = new Map(); // id -> L.marker
    this.selectedMarkerCallback = null;
  }

  init(onItemClick = null) {
    this.selectedMarkerCallback = onItemClick;
    const container = document.getElementById(this.containerId);
    if (!container || !window.L) {
      console.warn('Map container or Leaflet not ready');
      return;
    }

    // Initialize Leaflet map
    this.map = L.map(this.containerId, {
      center: [REVA_CAMPUS_CENTER.lat, REVA_CAMPUS_CENTER.lng],
      zoom: REVA_CAMPUS_CENTER.zoom,
      minZoom: 15,
      maxZoom: 19,
      zoomControl: false
    });

    // Add Zoom control at top-right
    L.control.zoom({ position: 'topright' }).addTo(this.map);

    // Standard OpenStreetMap tiles (100% free, zero API key required, no watermarks)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // Create marker feature groups
    this.markerLayer = L.featureGroup().addTo(this.map);
    this.landmarkLayer = L.featureGroup().addTo(this.map);

    // Render static REVA landmark markers
    this.renderCampusLandmarks();

    // Map click handler for picking custom location
    this.map.on('click', (e) => {
      window.dispatchEvent(new CustomEvent('map-coordinates-picked', {
        detail: { lat: e.latlng.lat, lng: e.latlng.lng }
      }));
    });

    // Invalidate size after layout settles
    setTimeout(() => {
      this.map.invalidateSize();
    }, 400);
  }

  renderCampusLandmarks() {
    this.landmarkLayer.clearLayers();

    REVA_LANDMARKS.forEach(landmark => {
      if (landmark.id === 'all') return;

      const icon = L.divIcon({
        className: 'custom-landmark-pin',
        html: `
          <div class="custom-map-pin" title="${escapeHtml(landmark.name)}">
            <div class="pin-bubble landmark">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span>${escapeHtml(landmark.name)}</span>
            </div>
          </div>
        `,
        iconSize: [120, 36],
        iconAnchor: [60, 36]
      });

      const marker = L.marker([landmark.lat, landmark.lng], { icon });
      marker.bindPopup(`
        <div class="map-popup-card" style="padding: 12px; font-size: 13px;">
          <strong style="color: #64D2FF; font-size: 14px;">${escapeHtml(landmark.name)}</strong>
          <p style="color: rgba(255,255,255,0.7); margin-top: 4px;">${escapeHtml(landmark.desc || 'REVA University Campus')}</p>
          <div style="margin-top: 8px; font-size: 11px; color: rgba(255,255,255,0.5);">Campus Landmark</div>
        </div>
      `, {
        maxWidth: 240,
        className: 'custom-glass-popup'
      });

      this.landmarkLayer.addLayer(marker);
    });
  }

  updateItemMarkers(items) {
    if (!this.map || !this.markerLayer) return;

    this.markerLayer.clearLayers();
    this.markersMap.clear();

    items.forEach(item => {
      if (!item.lat || !item.lng) return;

      const isLost = item.type === 'lost';
      const isReunited = item.status === 'reunited';
      const bubbleClass = isReunited ? 'reunited' : (isLost ? 'lost' : 'found');
      const labelText = isReunited ? 'REUNITED' : (isLost ? 'LOST' : 'FOUND');

      const icon = L.divIcon({
        className: 'custom-item-marker',
        html: `
          <div class="custom-map-pin">
            <div class="pin-bubble ${bubbleClass}">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                ${isLost
                  ? '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>'
                  : '<polyline points="20 6 9 17 4 12"/>'
                }
              </svg>
              <span>${labelText}</span>
            </div>
            ${!isReunited ? '<div class="pin-pulse-ring"></div>' : ''}
          </div>
        `,
        iconSize: [80, 40],
        iconAnchor: [40, 40]
      });

      const marker = L.marker([item.lat, item.lng], { icon });

      // Create rich glassmorphic popup
      const popupContent = `
        <div class="map-popup-card">
          <div class="popup-img-wrap">
            <img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.title)}" class="popup-img" onerror="this.src='https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=600&q=80'" />
            <div class="popup-badge">
              <span class="status-pill ${bubbleClass}">
                <span class="status-pulse-dot"></span>
                ${labelText}
              </span>
            </div>
          </div>
          <div class="popup-body">
            <h4 class="popup-title">${escapeHtml(item.title)}</h4>
            <div class="popup-location">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>${escapeHtml(item.landmark)}</span>
            </div>
            <div style="font-size: 11px; color: rgba(235,235,245,0.5);">
              ${formatRelativeTime(item.dateReported)}
            </div>
            <div class="popup-actions">
              <button class="popup-btn popup-btn-claim" onclick="window.triggerClaimModal('${item.id}')">
                ${isLost ? 'I Found This' : 'Claim Ownership'}
              </button>
              <button class="popup-btn popup-btn-view" onclick="window.scrollToItemCard('${item.id}')">
                Details
              </button>
            </div>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        maxWidth: 290,
        className: 'custom-glass-popup'
      });

      marker.on('click', () => {
        if (this.selectedMarkerCallback) {
          this.selectedMarkerCallback(item);
        }
      });

      this.markerLayer.addLayer(marker);
      this.markersMap.set(item.id, marker);
    });
  }

  focusItem(id) {
    const marker = this.markersMap.get(id);
    if (marker && this.map) {
      const latlng = marker.getLatLng();
      this.map.flyTo(latlng, 18, {
        animate: true,
        duration: 1.2
      });
      setTimeout(() => {
        marker.openPopup();
      }, 700);
    }
  }

  focusLandmark(landmarkId) {
    const lm = REVA_LANDMARKS.find(l => l.id === landmarkId);
    if (lm && this.map) {
      this.map.flyTo([lm.lat, lm.lng], 18, {
        animate: true,
        duration: 1.2
      });
    }
  }

  resetCampusView() {
    if (this.map) {
      this.map.flyTo([REVA_CAMPUS_CENTER.lat, REVA_CAMPUS_CENTER.lng], REVA_CAMPUS_CENTER.zoom, {
        animate: true,
        duration: 1.2
      });
    }
  }
}

export const campusMap = new CampusMapEngine();
