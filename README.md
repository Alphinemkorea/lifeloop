# LifeLoop - Full-Stack Web Application

LifeLoop is a full-stack React + Express web application designed for sharing private memory loops, scrapbook galleries, AI-powered digests, and weekly tree visualizers.

For comprehensive architectural, API, and feature documentation, please refer to [**PROJECT_DOCUMENTATION.md**](./PROJECT_DOCUMENTATION.md).

---

## 🌟 Key Features
- **🌿 Interactive Memory Tree**: Lush SVG canopy with uploaded picture bubbles, seasonal themes (Emerald, Autumn, Sakura, Twilight), and mood filters.
- **🧠 Gemini 3.6 AI Monthly Digest**: Automated storytelling recaps and emotional theme analytics powered by Gemini 3.6 Flash.
- **⏳ On-This-Day Flashbacks**: Relive nostalgic memories logged on the same calendar day with celebration confetti.
- **🗺️ Geotagged Memory Map**: Interactive world coordinate map showing memory location pins.
- **🎨 Freeform Scrapbook Canvas**: Moveable polaroid cards, background textures (corkboard, paper, grid, dark), and custom stickers.
- **📖 Keepsake Photobook & PDF Export**: Print-ready album formatting with high-res PDF print styling.
- **🎧 Cozy Ambient Soundscapes**: Built-in Web Audio API background audio generator (Rain, Fireplace, Lo-Fi, Ocean, Forest).
- **🎙️ Voice Note Recording**: Browser MediaRecorder API voice capture attached directly to memories.

---

## 📂 Project Directory Structure

```text
├── frontend/           <-- FRONTEND SOURCE CODE (React 18 + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── components/ <-- React UI components (WeeklyTreeCanvas, FreeformScrapbookCanvas, Photobook, etc.)
│   │   ├── pages/      <-- Application views (Dashboard, SpaceDetail, WeeklyTree, Profile, Admin)
│   │   ├── context/    <-- Global state & SettingsContext
│   │   └── hooks/      <-- Custom hooks (useAuth, useFetch)
│
├── backend/            <-- BACKEND SOURCE CODE (Node.js Express API)
│   ├── routes/         <-- REST endpoints (auth, spaces, moments, ai, admin)
│   ├── db.js           <-- JSON database layer
│   └── auth.js         <-- JWT auth middleware
│
├── PROJECT_DOCUMENTATION.md <-- Comprehensive project architecture & API guide
├── server.js           <-- Express + Vite full-stack server entry point
└── package.json        <-- NPM dependencies & scripts
```

---

## 🚀 How to Run the App After Unzipping

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- NPM (comes installed with Node.js)

### Step 1: Open Terminal / Command Prompt
Navigate to the project directory:
```bash
cd path/to/unzipped-lifeloop-folder
```

### Step 2: Install Dependencies
Run the following command to install all required npm packages:
```bash
npm install
```

### Step 3: Start the Application
Run the development server command:
```bash
npm run dev
```

### Step 4: Open in Browser
Open your browser and navigate to:
```text
http://localhost:3000
```

