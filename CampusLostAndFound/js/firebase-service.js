/**
 * FIREBASE BACKEND SERVICE: FIRESTORE CRUD & STORAGE UPLOADS
 * Handles real-time syncing, document creation, image uploads, and status updates
 */

import {
  firebaseState,
  initFirebase,
  getActiveFirebaseConfig,
  isPlaceholderConfig,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  ref,
  uploadBytes,
  getDownloadURL
} from './firebase-config.js';

export class FirebaseBackendService {
  constructor() {
    this.state = firebaseState;
    this.unsubscribeListener = null;
  }

  isLive() {
    return !!(this.state && this.state.isLive && this.state.db);
  }

  getConfig() {
    return getActiveFirebaseConfig();
  }

  reconnect(newConfig = null) {
    if (this.unsubscribeListener) {
      this.unsubscribeListener();
      this.unsubscribeListener = null;
    }

    if (newConfig) {
      localStorage.setItem('reva_custom_firebase_config', JSON.stringify(newConfig));
    }

    this.state = initFirebase(newConfig);

    window.dispatchEvent(new CustomEvent('firebase-status-changed', {
      detail: {
        isLive: this.isLive(),
        projectId: this.state.config?.projectId || 'local'
      }
    }));

    return this.isLive();
  }

  // Upload an image file to Firebase Storage
  async uploadPhoto(file) {
    if (!file) return null;

    if (!this.isLive() || !this.state.storage) {
      // Fallback: convert file to Base64 Data URL for local/offline operation
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
    }

    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `items/${Date.now()}_${sanitizedName}`;
      const storageRef = ref(this.state.storage, filename);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadUrl = await getDownloadURL(snapshot.ref);
      console.log('📸 [Firebase Storage] Uploaded photo:', downloadUrl);
      return downloadUrl;
    } catch (err) {
      console.warn('⚠️ [Firebase Storage] Upload failed, falling back to local data URL:', err);
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.readAsDataURL(file);
      });
    }
  }

  // Real-time listener for all lost & found items
  startRealtimeFeed(onItemsChanged) {
    if (!this.isLive()) return null;

    try {
      const itemsCollection = collection(this.state.db, 'lost_and_found_items');
      const q = query(itemsCollection, orderBy('dateReported', 'desc'));

      this.unsubscribeListener = onSnapshot(q, (snapshot) => {
        const items = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          items.push({
            firestoreDocId: docSnap.id,
            id: docSnap.id,
            ...data
          });
        });
        console.log(`🔥 [Firestore] Real-time snapshot updated (${items.length} items)`);
        onItemsChanged(items);
      }, (err) => {
        console.warn('⚠️ [Firestore] Snapshot listener error:', err);
      });

      return this.unsubscribeListener;
    } catch (err) {
      console.warn('⚠️ [Firestore] Error starting listener:', err);
      return null;
    }
  }

  // Add new item document to Firestore
  async addPost(itemData) {
    if (!this.isLive()) {
      return null;
    }

    try {
      const itemsCollection = collection(this.state.db, 'lost_and_found_items');
      const docData = {
        type: itemData.type,
        title: itemData.title,
        category: itemData.category,
        landmark: itemData.landmark,
        locationDetail: itemData.locationDetail || itemData.landmark,
        lat: Number(itemData.lat) || 13.1167,
        lng: Number(itemData.lng) || 77.6346,
        description: itemData.description || '',
        image: itemData.image || '',
        status: itemData.status || 'active',
        reporterName: itemData.reporterName,
        reporterSrn: itemData.reporterSrn || 'REVA-STUDENT',
        reporterPhone: itemData.reporterPhone,
        reporterEmail: itemData.reporterEmail || '',
        dateReported: itemData.dateReported || new Date().toISOString(),
        serverCreatedAt: serverTimestamp()
      };

      const docRef = await addDoc(itemsCollection, docData);
      console.log('🔥 [Firestore] Added document with ID:', docRef.id);
      return { id: docRef.id, ...docData };
    } catch (err) {
      console.error('❌ [Firestore] Failed to add document:', err);
      return null;
    }
  }

  // Update item status (e.g. 'reunited')
  async updateStatus(docId, newStatus) {
    if (!this.isLive() || !docId) return false;

    try {
      const docRef = doc(this.state.db, 'lost_and_found_items', docId);
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: serverTimestamp()
      });
      console.log(`🔥 [Firestore] Updated document ${docId} status to:`, newStatus);
      return true;
    } catch (err) {
      console.error(`❌ [Firestore] Failed to update document ${docId}:`, err);
      return false;
    }
  }

  // Record a claim or verification inquiry in the 'claims' collection
  async recordClaim(claimData) {
    if (!this.isLive()) return null;

    try {
      const claimsCollection = collection(this.state.db, 'claims');
      const docRef = await addDoc(claimsCollection, {
        ...claimData,
        timestamp: serverTimestamp(),
        createdAtIso: new Date().toISOString()
      });
      console.log('🔥 [Firestore] Recorded claim with ID:', docRef.id);
      return docRef.id;
    } catch (err) {
      console.warn('⚠️ [Firestore] Failed to record claim:', err);
      return null;
    }
  }
}

export const firebaseService = new FirebaseBackendService();
