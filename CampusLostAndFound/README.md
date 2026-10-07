# 🧭 REVA University Campus Lost & Found

> A high-end, responsive, and visually stunning Lost & Found web application designed with **Apple Human Interface Guidelines (HIG)** aesthetics, tailored specifically for **REVA University, Yelahanka, Bangalore**.

---

## 🌟 Key Highlights & Design System

### 1. Apple Human Interface Guidelines (HIG) Aesthetics
- **Typography**: Clean typographic hierarchy using `SF Pro Display`, `-apple-system`, and `Inter` with subtle letter-spacing and strong font-weight contrast.
- **Glassmorphism**: Translucent frosted glass surfaces (`backdrop-filter: blur(28px) saturate(190%)`), delicate specular highlight borders (`rgba(255, 255, 255, 0.18)`), and soft multi-layered diffuse shadows.
- **Atmosphere & Visuals**:
  - Ambient aerial visual with continuous slow-pan Ken Burns animation (`@keyframes kenBurns`).
  - Subtle dark gradient overlays (`rgba(5, 5, 8, 0.72)`) ensuring maximum legibility and contrast.
  - Floating ambient orbs creating a dynamic lighting aura.
- **Color Palette**:
  - 🔵 **Electric Blue** (`#0A84FF`) - Brand accents and primary actions
  - 🟢 **Emerald Green** (`#30D158`) - Found items, active indicators, and success states
  - 🔴 **Coral Red** (`#FF453A`) - Lost items and high-priority alerts
  - 🟡 **Sunset Amber** (`#FF9F0A`) - Pending verification status
  - 🟦 **Teal** (`#64D2FF`) - Reunited & resolved reports

---

## 🚀 Key Features

### 1. Interactive REVA Campus Radar (Map)
- Centered accurately at **REVA University, Yelahanka, Bangalore** (`13.1167° N, 77.6346° E`).
- **Custom Animated Pins**: Pulsing coral red pins for Lost items, emerald green pins for Found items, and blue badges for campus landmarks.
- **Campus Landmarks**:
  - Central Library (*Kalpana Chawla Block*)
  - Science & Technology Block (*C.V. Raman Block*)
  - Food Court & Central Canteen
  - Kuvempu Auditorium
  - Administrative Block (*Sir M. Visvesvaraya Block*)
  - Gazebo & Open Amphitheatre Lawns
  - Sports Complex & Indoor Stadium
  - School of Architecture & Design
- **Glassmorphic Map Popups**: Previews item photo, location, relative report time, and provides instant "Claim / Contact" actions.

### 2. Main Dashboard & Card Feed
- **Live Stats Ticker**: Real-time counter of items reunited, active reports, and recovery rate.
- **Search & Filter Toolbar**:
  - Instant keyword search with `⌘K` / `/` shortcut.
  - Apple segmented control (`All Items`, `Lost`, `Found`).
  - Category filter chips (Electronics, Documents & IDs, Keys, Watches, Bags & Wallets, Books & Stationery, Others).
  - Zone filtering by campus landmark.
- **Item Cards Grid**:
  - Image thumbnails with smooth hover zoom.
  - Pulsing status badges (`LOST`, `FOUND`, `REUNITED`).
  - Privacy-preserving masked phone numbers (`••••••••••`) with one-click **"Reveal Info"** action and direct WhatsApp link.
  - "Claim / I Found This" modal launcher.
  - "Locate on Map" quick-pan button.

### 3. Apple-Style Post Item Modal
- Segmented toggle: **I Lost an Item** vs **I Found an Item**.
- Auto-fill coordinates based on selected REVA landmark.
- Drag-and-drop photo upload with live preview and removal.
- **Quick Hackathon Demo Presets**: Instant 1-click sample photos (AirPods, Calculator, ID Badge, Keys, Backpack, Watch) for effortless testing by evaluators.
- Comprehensive contact details (Student Name, SRN, WhatsApp phone, college email).

### 4. Claim & Verification Modal
- Confidential proof question (e.g. lockscreen wallpaper, sticker placement, internal contents).
- Direct WhatsApp connector with pre-crafted message opening in one click:
  `https://wa.me/<phone>?text=Hi...`
- **Mark as Reunited**: One-click status resolution with celebratory haptic sound and toast notification.

### 5. Firebase Cloud Backend & Data Hub
- **Firebase Modular SDK (v10.8.0)**:
  - **Cloud Firestore**: Real-time snapshot sync (`onSnapshot`) for collections `lost_and_found_items` and `claims`.
  - **Firebase Storage**: Direct image upload and URL resolution (`uploadBytes` & `getDownloadURL`) for item photographs.
  - **Offline-First Fallback**: If placeholder keys are active, the app falls back to LocalStorage with instant mock data so the hackathon demo is 100% active immediately without any setup required.
  - **Dynamic In-App Config**: Change project credentials anytime through the Settings modal (`Cloud Sync & Data Hub`).
- **Google Sheets API Webhook**: Optional secondary sync to record every post and claim in a Google Sheet.
- **Backup & Restore**: JSON data export, file import, and instant reset to default REVA mock items.

---

## 🛠️ Tech Stack
- **Frontend**: HTML5, Modern CSS (Apple HIG Design System, Glassmorphism, CSS Grid & Flexbox), Vanilla JavaScript (ES6+ Modules).
- **Backend**: Firebase Firestore (NoSQL Realtime Database) & Firebase Storage (Blob/Image storage).
- **Mapping**: Leaflet.js with standard OpenStreetMap tiles & custom dark filter (zero API key dependency, 100% watermark-free).
- **Audio & Haptics**: Web Audio API synthesized subtle Apple click and chime feedback.
- **Server**: Zero-dependency Node.js HTTP server.

---

## 💻 How to Run Locally

```bash
# 1. Clone or navigate to the repository directory
cd /Users/abhinav/Documents/CampusLostAndFound

# 2. Start the local server
npm start
# or
node server.js

# 3. Open in your browser
http://localhost:3000
```

---

## 📱 Responsive Support
Fully responsive across:
- **Mobile Phones** (360px - 480px)
- **Tablets & iPads** (768px - 1024px)
- **Desktops & MacBooks** (1280px+)
