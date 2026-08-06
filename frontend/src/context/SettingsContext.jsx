import React, { createContext, useState, useContext, useEffect } from 'react';

export const THEMES = [
  {
    id: 'black-hotpink',
    name: 'Blank & Hot Pink',
    description: 'Deep pitch-black canvas with energetic hot pink accents',
    preview: ['#09090b', '#18181b', '#ff1493', '#f43f5e']
  },
  {
    id: 'white-black',
    name: 'White & Black',
    description: 'Sleek high-contrast white canvas with bold black accents',
    preview: ['#ffffff', '#f8fafc', '#000000', '#27272a']
  },
  {
    id: 'darkblue-lightblue',
    name: 'Dark Blue & Light Blue',
    description: 'Deep oceanic navy background with sky blue accents',
    preview: ['#0b132b', '#1c2541', '#38bdf8', '#0ea5e9']
  },
  {
    id: 'black-grey',
    name: 'Black & Grey',
    description: 'Dark obsidian canvas with soft granite and slate accents',
    preview: ['#121212', '#1e1e1e', '#a1a1aa', '#71717a']
  },
  {
    id: 'pink-purple',
    name: 'Pink & Purple',
    description: 'Velvet midnight purple canvas with vibrant fuchsia accents',
    preview: ['#1e1b4b', '#2e1065', '#ec4899', '#c084fc']
  },
  {
    id: 'emerald-mint',
    name: 'Emerald & Mint',
    description: 'Rich forest green canvas with refreshing mint green highlights',
    preview: ['#022c22', '#064e3b', '#34d399', '#10b981']
  },
  {
    id: 'sunset-amber',
    name: 'Sunset Amber',
    description: 'Warm mahogany dark canvas with glowing amber & coral accents',
    preview: ['#1c1917', '#292524', '#f59e0b', '#fb923c']
  },
  {
    id: 'springgreen-deeponyx',
    name: 'Spring Green & Deep Onyx',
    description: 'Deep obsidian-onyx canvas with vibrant spring green highlights',
    preview: ['#0a0f0d', '#141c18', '#22c55e', '#86efac']
  },
  {
    id: 'darkazure-softblue',
    name: 'Dark Azure & Soft Blue',
    description: 'Rich dark azure backdrop with soft blue and cyan accents',
    preview: ['#031325', '#0a2239', '#3b82f6', '#93c5fd']
  },
  {
    id: 'royalpurple-darkplum',
    name: 'Royal Purple & Dark Plum',
    description: 'Deep velvet plum canvas with majestic royal purple accents',
    preview: ['#1a0921', '#2a1035', '#a855f7', '#e9d5ff']
  },
  {
    id: 'abyss-frost',
    name: 'Abyss & Frost',
    description: 'Abyssal deep space canvas with icy frost teal highlights',
    preview: ['#050b14', '#0d1726', '#2dd4bf', '#a5f3fc']
  },
  {
    id: 'white-darkblue',
    name: 'White & Dark Blue',
    description: 'Clean crisp white canvas with authoritative deep royal navy accents',
    preview: ['#ffffff', '#f1f5f9', '#1e3a8a', '#2563eb']
  },
  {
    id: 'obsidian-lime',
    name: '#222222 & #89E900',
    description: 'Sleek #222222 obsidian dark canvas with electric #89E900 neon lime',
    preview: ['#181818', '#222222', '#89E900', '#c2f763']
  },
  {
    id: 'ghost-persian',
    name: 'Ghost & Persian',
    description: 'Ethereal ghost white canvas (#f8f9fa) with rich Persian indigo accents',
    preview: ['#f8f9fa', '#ffffff', '#32127a', '#5426b3']
  }
];

export const BG_STYLES = [
  { id: 'aurora', name: 'Aurora Glow', description: 'Fluid animated ambient light waves with soft glowing hues' },
  { id: 'particles', name: 'Interactive Star Particles', description: 'Twinkling particles canvas that reacts softly to mouse movements' },
  { id: 'grid', name: 'Glass Grid & Spotlight', description: 'Futuristic geometric grid with subtle ambient mouse spotlight' },
  { id: 'orbs', name: 'Floating Glass Orbs', description: 'Floating soft color spheres shifting gently across the viewport' },
  { id: 'nebula', name: 'Cosmic Nebula', description: 'Deep glowing space nebula clouds with floating cosmic stardust' },
  { id: 'sunset', name: 'Sunset Mesh Waves', description: 'Warm mahogany and golden hour ambient gradient waves' },
  { id: 'prism', name: 'Crystal Prism Light', description: 'Geometric light-refracting prism beams that shift with cursor motion' },
  { id: 'clean', name: 'Clean Solid Canvas', description: 'Minimalist clean background without ambient particle effects' }
];

export const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    return localStorage.getItem('app_theme') || 'black-hotpink';
  });
  const [bgStyle, setBgStyleState] = useState(() => {
    return localStorage.getItem('app_bg_style') || 'aurora';
  });
  const [isAdminVerified, setIsAdminVerified] = useState(() => sessionStorage.getItem('admin_verified') === 'true');

  const setTheme = (newTheme) => {
    setThemeState(newTheme);
    localStorage.setItem('app_theme', newTheme);
  };

  const setBgStyle = (newBgStyle) => {
    setBgStyleState(newBgStyle);
    localStorage.setItem('app_bg_style', newBgStyle);
  };

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const verifyAdmin = (status) => {
    setIsAdminVerified(status);
    if (status) {
      sessionStorage.setItem('admin_verified', 'true');
    } else {
      sessionStorage.removeItem('admin_verified');
    }
  };

  return (
    <SettingsContext.Provider value={{ theme, setTheme, THEMES, bgStyle, setBgStyle, BG_STYLES, isAdminVerified, verifyAdmin }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
