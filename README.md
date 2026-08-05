# LifeLoop - Full-Stack Web Application

LifeLoop is a full-stack React + Express web application designed for sharing private memory loops, scrapbook galleries, and weekly tree visualizers.

---

##  Project Directory Structure

```text
├── src/                <--  FRONTEND SOURCE CODE (React + Tailwind CSS)
│   ├── components/     <-- React UI components (Navbar, Sidebar, Cards, Modals)
│   ├── pages/          <-- Application views (Home, Spaces, Moments, Tree, Admin)
│   ├── context/        <-- Auth & Settings React Context
│   ├── hooks/          <-- Custom hooks (useAuth, useFetch)
│   ├── App.jsx         <-- Main React routes & setup
│   ├── main.jsx        <-- React DOM entry point
│   └── index.css       <-- Global CSS & Tailwind imports
│
├── backend/            <--  BACKEND SOURCE CODE (Express API)
│   ├── routes/         <-- Express REST API endpoints (auth, spaces, moments, admin)
│   ├── db.js           <-- JSON database & storage methods
│   ├── auth.js         <-- JWT & password hashing middleware
│   └── seedData.js     <-- Initial sample seed data
│
├── index.html          <-- Frontend HTML entry point
├── server.js           <-- Express + Vite full-stack server entry point
├── package.json        <-- NPM dependencies & scripts
└── vite.config.js      <-- Vite build configuration
```

---

##  How to Run the App After Unzipping

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher)
- NPM (comes installed with Node.js)

### Step 1: Extract the ZIP
Unzip the downloaded `.zip` file into any folder on your computer.

### Step 2: Open Terminal / Command Prompt
Open your terminal (macOS/Linux) or Command Prompt / PowerShell (Windows) and navigate to the project directory:
```bash
cd path/to/unzipped-lifeloop-folder
```

### Step 3: Install Dependencies
Run the following command to install all required npm packages for both frontend and backend:
```bash
npm install
```

### Step 4: Start the Application
Run the development server command:
```bash
npm run dev
```

### Step 5: Open in Browser
Open your browser and navigate to:
```text
http://localhost:3000
```

---

##  Key Features
- **Frontend (`/src`)**: Single Page Application built with React, Vite, Lucide Icons, and Tailwind CSS.
- **Backend (`/backend`)**: Node.js Express server handling authentication, user profiles, moments, spaces, and admin control.
- **Admin Portal**: Access via the top-right **Admin Page** button or navigation sidebar to change color themes, print frequencies, and reset data.
