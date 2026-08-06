# LifeLoop — Project Documentation & Architectural Guide

Welcome to the official technical documentation for **LifeLoop**, a full-stack digital memory scrapbook, ambient visualizer, and AI-powered storytelling platform.

---

## 📋 Table of Contents
1. [Executive Overview](#1-executive-overview)
2. [Tech Stack & Architecture](#2-tech-stack--architecture)
3. [Directory Structure](#3-directory-structure)
4. [Core Features Breakdown](#4-core-features-breakdown)
   - [Interactive Weekly Memory Tree](#-interactive-weekly-memory-tree)
   - [Gemini 3.6 AI Monthly Digest & Mood Analytics](#-gemini-36-ai-monthly-digest--mood-analytics)
   - [On-This-Day Nostalgia Flashbacks](#-on-this-day-nostalgia-flashbacks)
   - [Geotagged Memory Map](#-geotagged-memory-map)
   - [Freeform Drag-and-Drop Scrapbook Canvas](#-freeform-drag-and-drop-scrapbook-canvas)
   - [Printable Keepsake Photobook & PDF Export](#-printable-keepsake-photobook--pdf-export)
   - [Cozy Ambient Soundscapes Player](#-cozy-ambient-soundscapes-player)
   - [Voice Note Recording & Audio Attachments](#-voice-note-recording--audio-attachments)
   - [Private Spaces & Collaboration](#-private-spaces--collaboration)
   - [Admin Control & Theme Engine](#-admin-control--theme-engine)
5. [Data Flow & System Integration](#5-data-flow--system-integration)
6. [API Route Reference](#6-api-route-reference)
7. [Installation & Local Setup](#7-installation--local-setup)

---

## 1. Executive Overview

**LifeLoop** transforms personal and group memory sharing into an immersive, multi-sensory experience. Instead of traditional linear social media feeds, LifeLoop provides private **Memory Spaces** where families, couples, and close groups can capture photos, voice notes, music picks, and emotional reflections.

### Key Goals:
* **Tangible Digital Memory Keepsakes**: Transforming digital logs into physical-feeling scrapbooks, printable photobooks, and visual trees.
* **Intelligent AI Reflections**: Leveraging Gemini 3.6 Flash to synthesize monthly emotional themes, story recaps, and thoughtful prompts.
* **Multi-Sensory Memory Capture**: Combining visual polaroids, location coordinates, ambient audio generators, and voice notes.
* **Instant Reactivity**: Utilizing custom event dispatchers so new moments instantly blossom on trees and maps without full page reloads.

---

## 2. Tech Stack & Architecture

### Frontend (Client Tier)
* **Framework**: React 18 with Vite build tool.
* **Styling**: Tailwind CSS with custom glassmorphism panels, CSS gradients, and fluid responsive design.
* **Icons**: `lucide-react` icon library.
* **Audio Synthesis**: Native Browser **Web Audio API** (Oscillators, GainNodes, Biquad Filters for rain, fireplace, ocean, and lo-fi chord synthesis).
* **Audio Capture**: Browser **MediaRecorder API** for inline microphone recording.
* **Special FX**: `canvas-confetti` for celebratory nostalgia triggers.

### Backend (Server Tier)
* **Runtime Environment**: Node.js with Express v4.
* **AI Integration**: `@google/genai` SDK using the `gemini-3.6-flash` model for monthly digests, AI reflections, and automated memory prompts.
* **Authentication**: JSON Web Tokens (JWT) with bcrypt password hashing and token validation middleware.
* **Database Engine**: Persistent JSON-backed object store (`/backend/data.json`) with atomic write capabilities and automated seeding.

---

## 3. Directory Structure

```text
lifeloop-app/
├── package.json                   # Project dependencies and npm scripts
├── server.js                      # Express + Vite hybrid full-stack entry point
├── vite.config.js                 # Vite bundler configuration
│
├── backend/                       # REST API Backend Service
│   ├── auth.js                    # JWT auth middleware & password encryption
│   ├── config.js                  # Global backend configuration settings
│   ├── data.json                  # Persistent JSON storage database
│   ├── db.js                      # Data access layer (CRUD operations for moments, spaces, users)
│   ├── seedData.js                # Default seed datasets for initial bootstrapping
│   └── routes/                    # API Route Handlers
│       ├── adminRoutes.js         # Admin portal settings & system resets
│       ├── aiRoutes.js            # Gemini 3.6 Flash AI reflection & monthly digest routes
│       ├── authRoutes.js          # User registration, login, and token verification
│       ├── commentRoutes.js       # Memory moment comments
│       ├── momentRoutes.js        # CRUD endpoints for memory moments & photos
│       ├── profileRoutes.js       # User profile updates & stats
│       ├── reactionRoutes.js      # Heart & emoji reaction endpoints
│       ├── searchRoutes.js        # Global memory search & filters
│       └── spaceRoutes.js         # Private space creation, joining & membership
│
└── frontend/                       # React Single Page Application
    ├── index.html                 # Main HTML document template
    └── src/
        ├── main.jsx               # React DOM entry point
        ├── App.jsx                # Router, global layouts, and notification toasts
        ├── index.css              # Global Tailwind imports & custom scrollbar rules
        ├── types.js               # Common constants (Moods, Categories)
        │
        ├── context/               # Global React State
        │   └── SettingsContext.jsx # Admin site configuration context (theme color, print settings)
        │
        ├── hooks/                 # Custom React Hooks
        │   ├── useAuth.js         # Authentication state & login methods
        │   └── useFetch.js        # Data fetching hook with event listener reactivity
        │
        ├── components/            # Reusable UI Components
        │   ├── Navbar.jsx         # Top navigation header & ambient audio player trigger
        │   ├── AmbientSoundscapePlayer.jsx # Web Audio API background noise generator
        │   ├── AudioRecorder.jsx  # Microphone recording UI component
        │   ├── FreeformScrapbookCanvas.jsx # Drag-and-drop polaroid collage board
        │   ├── GeotaggedMemoryMap.jsx      # Interactive map with location pins
        │   ├── KeepsakePhotobook.jsx       # Print-ready photobook modal with print CSS
        │   ├── MonthlyAIDigest.jsx         # Gemini AI monthly analytics & story recap
        │   ├── OnThisDayCard.jsx           # Flashback memories card with confetti trigger
        │   ├── WeeklyTreeCanvas.jsx        # Lush SVG canopy with picture bubbles
        │   ├── MomentCard.jsx              # Individual memory moment item
        │   ├── MomentModal.jsx             # Memory creation & view modal
        │   ├── SpaceCard.jsx               # Shared memory space card
        │   └── EditSpaceModal.jsx          # Space management modal
        │
        └── pages/                 # Top-level Page Views
            ├── DashboardPage.jsx  # Main feed, map, nostalgia card, and AI digest
            ├── SpaceDetailPage.jsx# Detailed view of a space (feed, canvas, tree, members)
            ├── WeeklyTreePage.jsx # Dedicated weekly tree visualizer view
            ├── ProfilePage.jsx    # User statistics and personal memories
            ├── SearchPage.jsx     # Memory filter & search page
            └── AdminPage.jsx      # Site admin dashboard & controls
```

---

## 4. Core Features Breakdown

### 🌿 Interactive Weekly Memory Tree
* **Picture Bubbles on Branches**: Moments posted to a space appear as circular picture bubbles hanging on tree branches with uploaded photos.
* **Instant Reactivity**: Adding a new moment immediately dispatches a `moment_created` event, auto-refreshing the tree without page reloads.
* **Seasonal Canopy Switcher**: Toggle between 4 distinct visual atmospheres:
  - *Lush Emerald* (emerald foliage with soft green glow)
  - *Golden Autumn* (warm amber & orange autumn leaves)
  - *Sakura Blossom* (vibrant pink cherry blossom canopy)
  - *Starlight Twilight* (deep twilight indigo with starlight glows)
* **Mood Filters**: Filter picture bubbles on the tree by mood (*Happy*, *Excited*, *Calm*, *Reflective*, *Grateful*, *Loved*).
* **Interactive Inspection**: Clicking any picture bubble opens a popover showing the full photo, author, date, voice note badge, and memory description.

### 🧠 Gemini 3.6 AI Monthly Digest & Mood Analytics
* **Automated Monthly Recaps**: Sends space moments to `gemini-3.6-flash` via the `@google/genai` SDK to generate a warm 3-4 sentence storytelling recap.
* **Dominant Atmosphere**: Identifies the top mood word and key emotional themes.
* **Intelligent Recommendations**: Suggests personalized memory logging tips based on past frequency.
* **Fallback Safety**: Gracefully synthesizes local analytical digests if API keys are absent or offline.

### ⏳ On-This-Day Nostalgia Flashbacks
* **Calendar Matching**: Automatically highlights memories logged on the exact same month and day from previous years.
* **Celebration Confetti**: Built-in celebration button triggering realistic canvas confetti particle effects upon opening nostalgia loops.

### 🗺️ Geotagged Memory Map
* **Location Pinning**: Maps memory location names to world coordinates on an interactive map stage.
* **Regional Filters**: Quickly jump between *North America*, *Europe*, *Asia*, and *Home & Local*.
* **Pin Tooltips & Modal**: Hover or click map pins to open memory details and navigation tags.

### 🎨 Freeform Drag-and-Drop Scrapbook Canvas
* **Moveable Polaroids**: Drag polaroid photo cards anywhere on a corkboard, paper, grid, or dark background stage.
* **Rotation Controls**: Adjust card tilt and rotation for a customized scrapbook feel.
* **Sticker Palette**: Stamp expressive stickers (🌸, ⭐, 🌿, ☕, 💌) onto the canvas.

### 📖 Printable Keepsake Photobook & PDF Export
* **Formatted Album Spread**: Organizes moments into dedicated cover pages, member dedications, and photo spreads.
* **Print-Ready CSS**: Uses `@media print` rules to hide UI controls during browser printing or PDF saving.

### 🎧 Cozy Ambient Soundscapes Player
* **Web Audio Synthesis**: Built-in sound generator featuring 5 cozy audio profiles:
  - 🌧️ *Gentle Rain* (Pink noise generator with bandpass filter)
  - 🪵 *Cozy Fireplace* (Randomized procedural wood crackle pops)
  - 🎧 *Soft Lo-Fi Chords* (Sine wave chord synthesizer)
  - 🌊 *Ocean Waves* (LFO-modulated lowpass noise waves)
  - 🌲 *Forest Birds* (Procedural frequency chirps)

### 🎙️ Voice Note Recording & Audio Attachments
* **Microphone Capture**: Record voice notes directly in the memory modal via the HTML5 `MediaRecorder` API.
* **Audio Uploads**: Attach audio files or recorded voice notes to any memory moment.

### 🔒 Private Spaces & Collaboration
* **Role-Based Permissions**: Owners, Admins, and Members can collaborate within shared spaces.
* **Unique Space Codes**: Join spaces using 6-character alphanumeric invitation codes.

### ⚙️ Admin Control & Theme Engine
* **Dynamic Site Branding**: Customize site theme accent colors, print frequencies, and announcements.
* **System Diagnostics**: Inspect memory usage, system health, and database reset triggers.

---

## 5. Data Flow & System Integration

```text
 [ User Interface ] 
        │
        ├── (1) Create Moment / Voice Note ──► POST /api/moments
        │                                             │
        │                                     (Save to data.json)
        │                                             │
        ├── (2) Event: 'moment_created' ◄─────────────┘
        │            │
        │            ├──► Triggers useFetch Refetch
        │            ├──► Renders Picture Bubble on Tree Canvas
        │            └──► Updates Feed & Memory Map
        │
        └── (3) Request Monthly AI Digest ────► POST /api/ai/digest
                                                      │
                                           (GoogleGenAI SDK Call)
                                                      │
                                           [ Gemini 3.6 Flash ]
                                                      │
                                      ◄── Returns Story JSON
```

---

## 6. API Route Reference

### Authentication (`/api/auth`)
* `POST /api/auth/register` — Create new user account.
* `POST /api/auth/login` — Authenticate user & return JWT token.
* `GET /api/auth/me` — Retrieve logged-in user profile.

### Moments (`/api/moments`)
* `GET /api/moments` — Fetch memory moments (with pagination & filters).
* `POST /api/moments` — Create new memory moment (with photos & audio).
* `GET /api/moments/:id` — Get single memory details.
* `DELETE /api/moments/:id` — Remove memory moment.

### Memory Spaces (`/api/spaces`)
* `GET /api/spaces` — List user's joined spaces.
* `POST /api/spaces` — Create new memory space.
* `POST /api/spaces/join` — Join space using invite code.
* `GET /api/spaces/:id/weekly-tree` — Get weekly tree node hierarchy.

### AI Endpoints (`/api/ai`)
* `POST /api/ai/reflection` — Generate AI memory reflections & prompts.
* `POST /api/ai/digest` — Generate Gemini 3.6 monthly story digest & mood analytics.

### Admin (`/api/admin`)
* `GET /api/admin/settings` — Get global site configuration.
* `POST /api/admin/settings` — Update site theme color & settings.
* `POST /api/admin/reset` — Reset database to seed data.

---

## 7. Installation & Local Setup

### Prerequisites
* [Node.js](https://nodejs.org/) v18+ and `npm` installed.

### Quick Start
1. **Clone or Extract**:
   ```bash
   cd lifeloop-app
   ```
2. **Install Dependencies**:
   ```bash
   npm install
   ```
3. **Set Environment Variables** (Optional for Gemini AI features):
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
4. **Launch Application**:
   ```bash
   npm run dev
   ```
5. **Open Preview**:
   Navigate to `http://localhost:3000` in your web browser.

---

*LifeLoop — Preserving Life's Special Moments in Beautiful Loops.*
