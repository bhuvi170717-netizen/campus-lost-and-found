/**
 * UTILITIES: TIME FORMATTING, PHONE MASKING, TOASTS & AUDIO FEEDBACK
 */

// Format ISO date to human relative time
export function formatRelativeTime(isoString) {
  if (!isoString) return 'Just now';
  const now = new Date();
  const date = new Date(isoString);
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) {
    const mins = Math.floor(diffInSeconds / 60);
    return `${mins} min${mins > 1 ? 's' : ''} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  const days = Math.floor(diffInSeconds / 86400);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  
  return date.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Mask sensitive phone numbers for privacy (e.g. +91 98451 28941 -> +91 98••••••41)
export function maskPhoneNumber(phone) {
  if (!phone) return '••••••••••';
  const clean = phone.replace(/\s+/g, '');
  if (clean.length < 8) return '••••••' + clean.slice(-2);
  const prefix = clean.slice(0, clean.startsWith('+91') ? 5 : 2);
  const suffix = clean.slice(-2);
  return `${prefix} •••••• ${suffix}`;
}

// Clean phone number for WhatsApp wa.me link
export function cleanPhoneForWhatsApp(phone) {
  if (!phone) return '';
  let digits = phone.replace(/[^0-9]/g, '');
  if (digits.length === 10) {
    digits = '91' + digits; // Default India prefix
  }
  return digits;
}

// Web Audio API subtle Apple haptic sound synthesizer
let audioCtx = null;
function getAudioContext() {
  if (!audioCtx && (window.AudioContext || window.webkitAudioContext)) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

export function playHapticSound(type = 'click') {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;
    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.start(now);
      osc.stop(now + 0.22);
    }
  } catch {
    // Graceful fallback if audio is not permitted
  }
}

// Dynamic Island / Apple Toast Notification Banner
export function showToast(message, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  playHapticSound(type === 'success' ? 'success' : 'click');

  const toast = document.createElement('div');
  toast.className = `apple-toast ${type}`;

  const iconSvg = type === 'success'
    ? `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>`
    : `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`;

  toast.innerHTML = `
    ${iconSvg}
    <span>${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.transition = 'all 0.3s ease';
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-20px) scale(0.95)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 300);
  }, duration);
}

// Escape HTML for safe rendering
export function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// Category meta information
export const CATEGORY_MAP = {
  electronics: { label: 'Electronics', color: '#0A84FF', icon: 'zap' },
  documents: { label: 'Documents & IDs', color: '#BF5AF2', icon: 'file-text' },
  keys: { label: 'Keys', color: '#FFD60A', icon: 'key' },
  clothing: { label: 'Clothing & Accessories', color: '#FF9F0A', icon: 'watch' },
  bags: { label: 'Bags & Wallets', color: '#30D158', icon: 'briefcase' },
  books: { label: 'Books & Stationery', color: '#64D2FF', icon: 'book' },
  others: { label: 'Other Items', color: '#8E8E93', icon: 'box' }
};
