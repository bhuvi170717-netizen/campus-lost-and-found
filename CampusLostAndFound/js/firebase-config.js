/**
 * FIREBASE BACKEND & DATABASE INITIALIZATION
 * Modular Firebase SDK (v10.8.0) for Cloud Firestore & Firebase Storage
 */

import { initializeApp, getApps } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

// Placeholder config - replace with your Firebase project credentials or edit in the Settings modal
export const defaultFirebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Check if user has saved custom config in localStorage
export function getActiveFirebaseConfig() {
  try {
    const custom = localStorage.getItem('reva_custom_firebase_config');
    if (custom) {
      const parsed = JSON.parse(custom);
      if (parsed && parsed.apiKey && parsed.projectId) {
        return parsed;
      }
    }
  } catch {
    // Fallback
  }
  return defaultFirebaseConfig;
}

export function isPlaceholderConfig(config) {
  return !config ||
    config.apiKey === "YOUR_API_KEY" ||
    config.projectId === "YOUR_PROJECT_ID" ||
    !config.projectId ||
    config.projectId.includes("YOUR_PROJECT");
}

let firebaseApp = null;
let firestoreDb = null;
let firebaseStorage = null;

export function initFirebase(customConfig = null) {
  const config = customConfig || getActiveFirebaseConfig();

  if (isPlaceholderConfig(config)) {
    console.info("⚡ [Firebase] Using Local & Offline mode (Placeholder config detected). Set your project keys in Settings to connect live Firestore & Storage.");
    return {
      app: null,
      db: null,
      storage: null,
      isLive: false,
      config
    };
  }

  try {
    if (getApps().length === 0) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApps()[0];
    }

    firestoreDb = getFirestore(firebaseApp);
    firebaseStorage = getStorage(firebaseApp);

    console.info(`🔥 [Firebase] Initialized successfully for project: ${config.projectId}`);
    return {
      app: firebaseApp,
      db: firestoreDb,
      storage: firebaseStorage,
      isLive: true,
      config
    };
  } catch (err) {
    console.warn("⚠️ [Firebase] Initialization failed (falling back to offline-first local mode):", err);
    return {
      app: null,
      db: null,
      storage: null,
      isLive: false,
      config,
      error: err
    };
  }
}

// Initial instance
export const firebaseState = initFirebase();

export {
  initializeApp,
  getFirestore,
  collection,
  addDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  doc,
  updateDoc,
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
};
