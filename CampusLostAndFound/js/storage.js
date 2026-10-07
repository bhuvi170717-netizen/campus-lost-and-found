/**
 * DATA STORAGE & REAL-TIME SYNC LAYER
 * Supports LocalStorage (offline-first) + Firebase Firestore & Firebase Storage integration
 */

import { INITIAL_ITEMS } from './mock-data.js';
import { firebaseService } from './firebase-service.js';

const STORAGE_KEY = 'reva_lost_and_found_v1';
const SETTINGS_KEY = 'reva_sync_settings_v1';

export class StorageManager {
  constructor() {
    this.items = [];
    this.settings = {
      firebaseConfig: '',
      googleSheetsWebhook: '',
      autoSync: false,
      lastSyncTime: null
    };
    this.init();
  }

  init() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.items = JSON.parse(stored);
      } else {
        this.items = [...INITIAL_ITEMS];
        this.saveToLocal(false);
      }

      const settingsRaw = localStorage.getItem(SETTINGS_KEY);
      if (settingsRaw) {
        this.settings = { ...this.settings, ...JSON.parse(settingsRaw) };
      }
    } catch (e) {
      console.warn('Storage init fallback:', e);
      this.items = [...INITIAL_ITEMS];
    }

    // Connect to Firebase real-time feed if configured
    this.initFirebaseSync();

    // Listen for connection changes
    window.addEventListener('firebase-status-changed', () => {
      this.initFirebaseSync();
    });
  }

  initFirebaseSync() {
    if (firebaseService.isLive()) {
      firebaseService.startRealtimeFeed((remoteItems) => {
        if (remoteItems && remoteItems.length > 0) {
          // Merge remote items with local items
          const merged = [...remoteItems];
          // Preserve any initial mock items not yet in Firestore
          this.items.forEach(localItem => {
            if (!merged.some(r => r.id === localItem.id || r.title === localItem.title)) {
              merged.push(localItem);
            }
          });
          this.items = merged;
          this.saveToLocal(true);
        }
      });
    }
  }

  saveToLocal(dispatch = true) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
      if (dispatch) {
        window.dispatchEvent(new CustomEvent('items-updated', { detail: { items: this.items } }));
      }
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  getItems() {
    return [...this.items];
  }

  getItemById(id) {
    return this.items.find(item => item.id === id || item.firestoreDocId === id) || null;
  }

  async addItem(newItem) {
    let finalImageUrl = newItem.image;

    // Upload to Firebase Storage if raw file was selected
    if (newItem._rawFile) {
      try {
        const uploadedUrl = await firebaseService.uploadPhoto(newItem._rawFile);
        if (uploadedUrl) {
          finalImageUrl = uploadedUrl;
        }
      } catch (err) {
        console.warn('Photo upload fallback to local URL:', err);
      }
    }

    const itemWithDefaults = {
      id: `reva-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      dateReported: new Date().toISOString(),
      status: 'active',
      ...newItem,
      image: finalImageUrl
    };
    delete itemWithDefaults._rawFile;

    // Optimistic local update
    this.items.unshift(itemWithDefaults);
    this.saveToLocal(true);

    // Sync to Firestore if live
    if (firebaseService.isLive()) {
      try {
        const firestoreResult = await firebaseService.addPost(itemWithDefaults);
        if (firestoreResult) {
          itemWithDefaults.firestoreDocId = firestoreResult.id;
          itemWithDefaults.id = firestoreResult.id;
          this.saveToLocal(true);
        }
      } catch (err) {
        console.warn('Firestore addPost background warning:', err);
      }
    }

    // Optional Google Sheets webhook sync
    this.triggerCloudSync('create', itemWithDefaults);
    return itemWithDefaults;
  }

  async updateItemStatus(id, newStatus) {
    const idx = this.items.findIndex(item => item.id === id || item.firestoreDocId === id);
    if (idx !== -1) {
      this.items[idx].status = newStatus;
      const updated = this.items[idx];
      this.saveToLocal(true);

      // Sync status to Firestore
      if (firebaseService.isLive()) {
        const docId = updated.firestoreDocId || updated.id;
        await firebaseService.updateStatus(docId, newStatus);
      }

      this.triggerCloudSync('update', updated);
      return updated;
    }
    return null;
  }

  async recordClaim(claimData) {
    if (firebaseService.isLive()) {
      return await firebaseService.recordClaim(claimData);
    }
    return null;
  }

  deleteItem(id) {
    const idx = this.items.findIndex(item => item.id === id || item.firestoreDocId === id);
    if (idx !== -1) {
      const deleted = this.items.splice(idx, 1)[0];
      this.saveToLocal(true);
      this.triggerCloudSync('delete', deleted);
      return deleted;
    }
    return null;
  }

  resetToDefault() {
    this.items = JSON.parse(JSON.stringify(INITIAL_ITEMS));
    this.saveToLocal(true);
    return this.items;
  }

  exportDataJson() {
    return JSON.stringify(this.items, null, 2);
  }

  importDataJson(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        this.items = parsed;
        this.saveToLocal(true);
        return true;
      }
    } catch {
      return false;
    }
    return false;
  }

  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
  }

  getSettings() {
    return { ...this.settings };
  }

  // Cloud sync trigger (Google Sheets API)
  async triggerCloudSync(action, itemData) {
    if (!this.settings.googleSheetsWebhook) return;

    try {
      await fetch(this.settings.googleSheetsWebhook, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          timestamp: new Date().toISOString(),
          data: itemData
        })
      });
      this.settings.lastSyncTime = new Date().toISOString();
      this.saveSettings(this.settings);
    } catch (err) {
      console.warn('Cloud sync background error (non-fatal):', err);
    }
  }
}

export const storage = new StorageManager();
