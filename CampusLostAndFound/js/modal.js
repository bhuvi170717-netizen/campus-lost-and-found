/**
 * MODAL DIALOGS CONTROLLER
 * Post Item Modal, Claim / Verification Modal, and Cloud Sync Drawer
 */

import { storage } from './storage.js';
import { firebaseService } from './firebase-service.js';
import { REVA_LANDMARKS, PRESET_SAMPLE_PHOTOS } from './mock-data.js';
import { showToast, playHapticSound, cleanPhoneForWhatsApp, escapeHtml } from './utils.js';

export class ModalController {
  constructor() {
    this.activeModal = null;
    this.postType = 'lost'; // 'lost' | 'found'
    this.currentClaimItem = null;
    this.uploadedPhotoData = null;
    this.selectedPhotoFile = null;
    this.init();
  }

  init() {
    this.bindEvents();
    this.renderLandmarkOptions();
    this.renderQuickPhotoSamples();
  }

  bindEvents() {
    // Backdrop click to close
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeAllModals();
        }
      });
    });

    // Close buttons
    document.querySelectorAll('.btn-close-modal, .btn-modal-cancel').forEach(btn => {
      btn.addEventListener('click', () => {
        this.closeAllModals();
      });
    });

    // Keyboard ESC to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });

    // Post modal trigger
    const openPostBtn = document.getElementById('openPostModalBtn');
    if (openPostBtn) {
      openPostBtn.addEventListener('click', () => {
        this.openPostModal('lost');
      });
    }

    // Toggle Lost / Found inside Post Modal
    const toggleLostBtn = document.getElementById('typeToggleLost');
    const toggleFoundBtn = document.getElementById('typeToggleFound');

    if (toggleLostBtn && toggleFoundBtn) {
      toggleLostBtn.addEventListener('click', () => {
        this.setPostType('lost');
      });
      toggleFoundBtn.addEventListener('click', () => {
        this.setPostType('found');
      });
    }

    // Photo file input & drag and drop
    const fileInput = document.getElementById('itemPhotoInput');
    const dropZone = document.getElementById('photoDropZone');

    if (dropZone && fileInput) {
      dropZone.addEventListener('click', () => fileInput.click());

      dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
      });

      dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
      });

      dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          this.handlePhotoFile(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handlePhotoFile(e.target.files[0]);
        }
      });
    }

    // Remove photo button
    const removePhotoBtn = document.getElementById('removePhotoBtn');
    if (removePhotoBtn) {
      removePhotoBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.clearPhotoPreview();
      });
    }

    // Post item form submit
    const postForm = document.getElementById('postItemForm');
    if (postForm) {
      postForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handlePostSubmit();
      });
    }

    // Claim form submit
    const claimForm = document.getElementById('claimItemForm');
    if (claimForm) {
      claimForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleClaimSubmit();
      });
    }

    // Mark as reunited button
    const markReunitedBtn = document.getElementById('markAsReunitedBtn');
    if (markReunitedBtn) {
      markReunitedBtn.addEventListener('click', () => {
        this.handleMarkReunited();
      });
    }

    // Settings modal trigger
    const openSettingsBtn = document.getElementById('openSettingsBtn');
    if (openSettingsBtn) {
      openSettingsBtn.addEventListener('click', () => {
        this.openSettingsModal();
      });
    }

    // Firebase config form submit
    const fbForm = document.getElementById('firebaseConfigForm');
    if (fbForm) {
      fbForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveFirebaseConfig();
      });
    }

    // Reset Firebase config button
    const resetFbBtn = document.getElementById('resetFirebaseBtn');
    if (resetFbBtn) {
      resetFbBtn.addEventListener('click', () => {
        this.handleResetFirebaseConfig();
      });
    }

    // Google Sheets settings form
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
      settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSaveSettings();
      });
    }

    // Export & Import
    const exportBtn = document.getElementById('exportDataBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.handleExportData());
    }

    const importInput = document.getElementById('importDataInput');
    if (importInput) {
      importInput.addEventListener('change', (e) => this.handleImportData(e));
    }

    const resetBtn = document.getElementById('resetDataBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.handleResetData());
    }
  }

  renderLandmarkOptions() {
    const select = document.getElementById('itemLandmarkSelect');
    if (!select) return;

    select.innerHTML = '<option value="" disabled selected>Select Campus Landmark</option>';
    REVA_LANDMARKS.forEach(lm => {
      if (lm.id === 'all') return;
      const opt = document.createElement('option');
      opt.value = lm.name;
      opt.textContent = `${lm.name} (${lm.desc || 'REVA Campus'})`;
      opt.dataset.lat = lm.lat;
      opt.dataset.lng = lm.lng;
      select.appendChild(opt);
    });

    select.addEventListener('change', () => {
      const selectedOpt = select.selectedOptions[0];
      if (selectedOpt && selectedOpt.dataset.lat) {
        document.getElementById('itemLatInput').value = selectedOpt.dataset.lat;
        document.getElementById('itemLngInput').value = selectedOpt.dataset.lng;
      }
    });
  }

  renderQuickPhotoSamples() {
    const container = document.getElementById('quickSamplePills');
    if (!container) return;

    container.innerHTML = '';
    PRESET_SAMPLE_PHOTOS.forEach(sample => {
      const pill = document.createElement('button');
      pill.type = 'button';
      pill.className = 'sample-preset-btn';
      pill.textContent = sample.name;
      pill.addEventListener('click', () => {
        this.selectedPhotoFile = null;
        this.setPhotoPreview(sample.url);
      });
      container.appendChild(pill);
    });
  }

  setPostType(type) {
    this.postType = type;
    playHapticSound('click');

    const toggleLost = document.getElementById('typeToggleLost');
    const toggleFound = document.getElementById('typeToggleFound');
    const submitBtn = document.getElementById('postSubmitBtn');
    const modalTitle = document.getElementById('postModalTitle');

    if (type === 'lost') {
      toggleLost.className = 'type-toggle-btn active lost';
      toggleFound.className = 'type-toggle-btn';
      if (submitBtn) {
        submitBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Post Lost Item Report
        `;
        submitBtn.style.background = 'linear-gradient(135deg, #FF453A 0%, #D70015 100%)';
      }
      if (modalTitle) modalTitle.textContent = 'Report a Lost Item';
    } else {
      toggleLost.className = 'type-toggle-btn';
      toggleFound.className = 'type-toggle-btn active found';
      if (submitBtn) {
        submitBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Post Found Item Report
        `;
        submitBtn.style.background = 'linear-gradient(135deg, #30D158 0%, #248A3D 100%)';
      }
      if (modalTitle) modalTitle.textContent = 'Report a Found Item';
    }
  }

  handlePhotoFile(file) {
    if (!file.type.startsWith('image/')) {
      showToast('Please select a valid image file', 'info');
      return;
    }
    this.selectedPhotoFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.setPhotoPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  }

  setPhotoPreview(url) {
    this.uploadedPhotoData = url;
    const previewWrap = document.getElementById('photoPreviewWrap');
    const previewImg = document.getElementById('photoPreviewImg');
    const dropZone = document.getElementById('photoDropZone');

    if (previewWrap && previewImg && dropZone) {
      previewImg.src = url;
      previewWrap.style.display = 'block';
      dropZone.style.display = 'none';
    }
  }

  clearPhotoPreview() {
    this.uploadedPhotoData = null;
    this.selectedPhotoFile = null;
    const previewWrap = document.getElementById('photoPreviewWrap');
    const dropZone = document.getElementById('photoDropZone');
    const fileInput = document.getElementById('itemPhotoInput');

    if (previewWrap && dropZone) {
      previewWrap.style.display = 'none';
      dropZone.style.display = 'flex';
    }
    if (fileInput) fileInput.value = '';
  }

  openPostModal(type = 'lost') {
    this.setPostType(type);
    const modal = document.getElementById('postItemModal');
    if (modal) {
      modal.classList.add('active');
      this.activeModal = modal;
    }
  }

  openClaimModal(itemId) {
    const item = storage.getItemById(itemId);
    if (!item) return;

    this.currentClaimItem = item;
    const isLost = item.type === 'lost';

    // Populate modal elements
    const titleEl = document.getElementById('claimModalTitle');
    const subtitleEl = document.getElementById('claimModalSubtitle');
    const summaryImg = document.getElementById('claimItemImg');
    const summaryTitle = document.getElementById('claimItemTitle');
    const summaryMeta = document.getElementById('claimItemMeta');
    const waTextEl = document.getElementById('claimWhatsAppText');
    const waBtn = document.getElementById('directWhatsAppBtn');

    const proofGroup = document.getElementById('ownershipProofGroup');
    const proofInput = document.getElementById('claimProofInput');
    const finderLocationGroup = document.getElementById('finderLocationGroup');
    const finderLocationInput = document.getElementById('finderLocationInput');
    const nameLabel = document.getElementById('claimantNameLabel');
    const phoneLabel = document.getElementById('claimantPhoneLabel');
    const submitBtn = document.getElementById('claimSubmitBtn');

    if (summaryImg) summaryImg.src = item.image;
    if (summaryTitle) summaryTitle.textContent = item.title;
    if (summaryMeta) {
      summaryMeta.textContent = `${item.landmark} • Reported by ${item.reporterName} (${item.reporterPhone})`;
    }

    const cleanPhone = cleanPhoneForWhatsApp(item.reporterPhone);

    if (isLost) {
      // User clicked "I Found This" on a LOST item post
      if (titleEl) titleEl.textContent = 'I Found This Item!';
      if (subtitleEl) subtitleEl.textContent = `Connect with ${item.reporterName} to return their lost item`;

      if (proofGroup) proofGroup.style.display = 'none';
      if (proofInput) {
        proofInput.required = false;
        proofInput.value = '';
      }
      if (finderLocationGroup) finderLocationGroup.style.display = 'flex';
      if (finderLocationInput) finderLocationInput.value = '';

      if (nameLabel) nameLabel.textContent = "Finder's Full Name *";
      if (phoneLabel) phoneLabel.textContent = "Phone / WhatsApp Number *";

      if (submitBtn) {
        submitBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          <span>Notify Owner via WhatsApp</span>
        `;
      }

      if (waTextEl) {
        waTextEl.textContent = `Direct WhatsApp chat with owner: ${item.reporterName} (${item.reporterPhone})`;
      }
      if (waBtn) {
        const greetingMsg = encodeURIComponent(
          `Hi ${item.reporterName}, I found your lost item "${item.title}" reported on REVA Lost & Found. Let me know where we can meet on campus to return it.`
        );
        waBtn.href = `https://wa.me/${cleanPhone}?text=${greetingMsg}`;
        const waBtnSpan = waBtn.querySelector('span');
        if (waBtnSpan) waBtnSpan.textContent = 'Message Owner on WhatsApp';
      }
    } else {
      // User clicked "Claim Ownership" on a FOUND item post
      if (titleEl) titleEl.textContent = 'Claim Ownership';
      if (subtitleEl) subtitleEl.textContent = `Verify ownership and connect with ${item.reporterName}`;

      if (proofGroup) proofGroup.style.display = 'flex';
      if (proofInput) proofInput.required = true;
      if (finderLocationGroup) finderLocationGroup.style.display = 'none';

      if (nameLabel) nameLabel.textContent = 'Claimant Full Name *';
      if (phoneLabel) phoneLabel.textContent = 'Your WhatsApp Phone *';

      if (submitBtn) {
        submitBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg>
          <span>Send Ownership Proof</span>
        `;
      }

      if (waTextEl) {
        waTextEl.textContent = `Direct WhatsApp chat with finder: ${item.reporterName} (${item.reporterPhone})`;
      }
      if (waBtn) {
        const greetingMsg = encodeURIComponent(
          `Hi ${item.reporterName}, I saw your post on REVA Lost & Found regarding found item "${item.title}". I would like to verify ownership and claim it.`
        );
        waBtn.href = `https://wa.me/${cleanPhone}?text=${greetingMsg}`;
        const waBtnSpan = waBtn.querySelector('span');
        if (waBtnSpan) waBtnSpan.textContent = 'Message Finder on WhatsApp';
      }
    }

    const modal = document.getElementById('claimItemModal');
    if (modal) {
      modal.classList.add('active');
      this.activeModal = modal;
    }
  }

  openSettingsModal() {
    const modal = document.getElementById('settingsModal');
    const settings = storage.getSettings();
    const fbConfig = firebaseService.getConfig();

    const webhookInput = document.getElementById('settingsSheetsWebhook');
    if (webhookInput) webhookInput.value = settings.googleSheetsWebhook || '';

    // Populate Firebase config fields
    const pId = document.getElementById('fbProjectIdInput');
    const apiKey = document.getElementById('fbApiKeyInput');
    const bucket = document.getElementById('fbStorageBucketInput');
    const appId = document.getElementById('fbAppIdInput');

    if (pId) pId.value = fbConfig.projectId && fbConfig.projectId !== 'YOUR_PROJECT_ID' ? fbConfig.projectId : '';
    if (apiKey) apiKey.value = fbConfig.apiKey && fbConfig.apiKey !== 'YOUR_API_KEY' ? fbConfig.apiKey : '';
    if (bucket) bucket.value = fbConfig.storageBucket && !fbConfig.storageBucket.includes('YOUR_PROJECT') ? fbConfig.storageBucket : '';
    if (appId) appId.value = fbConfig.appId && fbConfig.appId !== 'YOUR_APP_ID' ? fbConfig.appId : '';

    this.updateFirebaseStatusPill();

    if (modal) {
      modal.classList.add('active');
      this.activeModal = modal;
    }
  }

  updateFirebaseStatusPill() {
    const pill = document.getElementById('firebaseStatusPill');
    const text = document.getElementById('firebaseStatusText');
    if (!pill || !text) return;

    if (firebaseService.isLive()) {
      pill.className = 'status-pill found';
      text.textContent = `Connected: ${firebaseService.state.config.projectId}`;
    } else {
      pill.className = 'status-pill lost';
      text.textContent = 'Local / Offline Mode';
    }
  }

  handleSaveFirebaseConfig() {
    const projectId = document.getElementById('fbProjectIdInput').value.trim();
    const apiKey = document.getElementById('fbApiKeyInput').value.trim();
    const storageBucket = document.getElementById('fbStorageBucketInput').value.trim();
    const appId = document.getElementById('fbAppIdInput').value.trim();

    if (!projectId || !apiKey) {
      showToast('Please enter both Project ID and API Key', 'info');
      return;
    }

    const newConfig = {
      projectId,
      apiKey,
      storageBucket: storageBucket || `${projectId}.appspot.com`,
      authDomain: `${projectId}.firebaseapp.com`,
      appId: appId || `1:${projectId}:web:auto`,
      messagingSenderId: '123456789'
    };

    const isLive = firebaseService.reconnect(newConfig);
    this.updateFirebaseStatusPill();

    if (isLive) {
      showToast(`🔥 Connected to Firebase (${projectId})!`, 'success');
    } else {
      showToast('Config saved, operating in local fallback mode', 'info');
    }
  }

  handleResetFirebaseConfig() {
    localStorage.removeItem('reva_custom_firebase_config');
    firebaseService.reconnect(null);
    this.updateFirebaseStatusPill();

    const pId = document.getElementById('fbProjectIdInput');
    const apiKey = document.getElementById('fbApiKeyInput');
    const bucket = document.getElementById('fbStorageBucketInput');
    const appId = document.getElementById('fbAppIdInput');
    if (pId) pId.value = '';
    if (apiKey) apiKey.value = '';
    if (bucket) bucket.value = '';
    if (appId) appId.value = '';

    showToast('Reset to default Firebase configuration', 'info');
  }

  closeAllModals() {
    document.querySelectorAll('.modal-overlay').forEach(modal => {
      modal.classList.remove('active');
    });
    this.activeModal = null;
  }

  async handlePostSubmit() {
    const title = document.getElementById('itemTitleInput').value.trim();
    const category = document.getElementById('itemCategorySelect').value;
    const landmark = document.getElementById('itemLandmarkSelect').value;
    const locationDetail = document.getElementById('itemLocationDetailInput').value.trim();
    const description = document.getElementById('itemDescriptionInput').value.trim();
    const reporterName = document.getElementById('itemReporterNameInput').value.trim();
    const reporterSrn = document.getElementById('itemReporterSrnInput').value.trim() || 'REVA-STUDENT';
    const reporterPhone = document.getElementById('itemReporterPhoneInput').value.trim();
    const reporterEmail = document.getElementById('itemReporterEmailInput').value.trim() || 'student@reva.edu.in';

    const latVal = parseFloat(document.getElementById('itemLatInput').value) || 13.1167;
    const lngVal = parseFloat(document.getElementById('itemLngInput').value) || 77.6346;

    if (!title || !category || !landmark || !reporterName || !reporterPhone) {
      showToast('Please fill in all required fields', 'info');
      return;
    }

    const photo = this.uploadedPhotoData || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?auto=format&fit=crop&w=700&q=80';

    const newItem = {
      type: this.postType,
      title,
      category,
      landmark,
      locationDetail: locationDetail || landmark,
      lat: latVal,
      lng: lngVal,
      description,
      image: photo,
      reporterName,
      reporterSrn,
      reporterPhone,
      reporterEmail,
      _rawFile: this.selectedPhotoFile
    };

    const submitBtn = document.getElementById('postSubmitBtn');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Saving...</span>`;
    }

    try {
      await storage.addItem(newItem);
      showToast(`Successfully reported ${this.postType} item!`, 'success');
      this.closeAllModals();

      // Reset form
      document.getElementById('postItemForm').reset();
      this.clearPhotoPreview();
    } catch (err) {
      console.error('Failed to post item:', err);
      showToast('Failed to save item, please try again', 'info');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        this.setPostType(this.postType);
      }
    }
  }

  async handleClaimSubmit() {
    if (!this.currentClaimItem) return;

    const isLost = this.currentClaimItem.type === 'lost';
    const name = document.getElementById('claimantNameInput').value.trim();
    const phone = document.getElementById('claimantPhoneInput').value.trim();

    if (!name || !phone) {
      showToast('Please provide your name and phone number', 'info');
      return;
    }

    let message = '';
    let proofDetails = '';

    if (isLost) {
      // User found the lost item
      const dropoff = document.getElementById('finderLocationInput')?.value.trim() || '';
      proofDetails = dropoff;
      message = `Hi ${this.currentClaimItem.reporterName}, I found your lost item "${this.currentClaimItem.title}" that was reported on REVA Lost & Found! My name is ${name} (${phone}).` +
        (dropoff ? ` Drop-off location / note: ${dropoff}` : ' Please let me know where we can meet on campus so I can return it.');
    } else {
      // User is claiming ownership of a found item
      const verificationProof = document.getElementById('claimProofInput')?.value.trim() || '';
      if (!verificationProof) {
        showToast('Please provide proof of ownership to verify', 'info');
        return;
      }
      proofDetails = verificationProof;
      message = `Hi ${this.currentClaimItem.reporterName}, I am ${name} (${phone}). ` +
        `Regarding the FOUND item "${this.currentClaimItem.title}" on REVA Lost & Found: ` +
        `Proof of ownership: ${verificationProof}`;
    }

    // Save claim record to Firestore
    try {
      await storage.recordClaim({
        itemId: this.currentClaimItem.id,
        itemTitle: this.currentClaimItem.title,
        type: isLost ? 'finder_report' : 'owner_claim',
        claimantName: name,
        claimantPhone: phone,
        details: proofDetails
      });
    } catch (e) {
      console.warn('Record claim non-fatal warning:', e);
    }

    // Trigger WhatsApp link directly
    const cleanPhone = cleanPhoneForWhatsApp(this.currentClaimItem.reporterPhone);
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`, '_blank');
    showToast(isLost ? 'Notifying owner via WhatsApp...' : 'Connecting via WhatsApp...', 'success');
    this.closeAllModals();
  }

  handleMarkReunited() {
    if (!this.currentClaimItem) return;

    storage.updateItemStatus(this.currentClaimItem.id, 'reunited');
    showToast(`Awesome! "${this.currentClaimItem.title}" marked as reunited!`, 'success');
    this.closeAllModals();
  }

  handleSaveSettings() {
    const webhook = document.getElementById('settingsSheetsWebhook').value.trim();
    storage.saveSettings({ googleSheetsWebhook: webhook });
    showToast('Sync settings saved successfully!', 'success');
    this.closeAllModals();
  }

  handleExportData() {
    const data = storage.exportDataJson();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reva_lost_and_found_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Exported backup file', 'success');
  }

  handleImportData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const ok = storage.importDataJson(ev.target.result);
      if (ok) {
        showToast('Data imported successfully!', 'success');
        this.closeAllModals();
      } else {
        showToast('Invalid JSON file format', 'info');
      }
    };
    reader.readAsText(file);
  }

  handleResetData() {
    if (confirm('Reset to default REVA University mock items?')) {
      storage.resetToDefault();
      showToast('Reset to default items', 'success');
      this.closeAllModals();
    }
  }
}

export const modals = new ModalController();
