import React, { useState } from 'react';
import { TreePine, Sparkles, Image as ImageIcon, Heart, X, User, Sun, Moon, Sparkle, Volume2, Navigation, Calendar } from 'lucide-react';

const MOOD_COLORS = {
  happy: '#F59E0B',
  excited: '#10B981',
  calm: '#38BDF8',
  reflective: '#A855F7',
  grateful: '#EC4899',
  loved: '#F43F5E'
};

const MOOD_EMOJIS = {
  happy: '😊',
  excited: '🎉',
  calm: '🌿',
  reflective: '🌙',
  grateful: '✨',
  loved: '💖'
};

const DEFAULT_PHOTOS = [
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=400&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=400&auto=format&fit=crop&q=80'
];

const BRANCH_POSITIONS = [
  { x: 300, y: 70 },   // Top apex
  { x: 190, y: 130 },  // Upper left branch
  { x: 410, y: 110 },  // Upper right branch
  { x: 130, y: 200 },  // Left main branch tip
  { x: 470, y: 180 },  // Right main branch tip
  { x: 230, y: 80 },   // High left crown
  { x: 370, y: 85 },   // High right crown
  { x: 240, y: 190 },  // Inner left branch
  { x: 360, y: 170 },  // Inner right branch
  { x: 170, y: 260 },  // Lower left branch
  { x: 430, y: 250 },  // Lower right branch
  { x: 280, y: 140 },  // Center upper stem
  { x: 320, y: 120 },  // Center top right
  { x: 110, y: 140 },  // Far left high
  { x: 490, y: 120 },  // Far right high
  { x: 210, y: 290 },  // Low left base branch
  { x: 390, y: 290 }   // Low right base branch
];

const CANOPY_THEMES = {
  emerald: {
    name: 'Lush Emerald',
    icon: '🌿',
    bg: 'from-slate-950 via-emerald-950/40 to-slate-950',
    foliagePrimary: '#059669',
    foliageSecondary: '#10B981',
    foliageAccent: '#34D399',
    trunkColor: '#78350F',
    glowColor: 'rgba(16, 185, 129, 0.25)'
  },
  autumn: {
    name: 'Golden Autumn',
    icon: '🍂',
    bg: 'from-slate-950 via-amber-950/40 to-slate-950',
    foliagePrimary: '#D97706',
    foliageSecondary: '#F59E0B',
    foliageAccent: '#FBBF24',
    trunkColor: '#451A03',
    glowColor: 'rgba(245, 158, 11, 0.25)'
  },
  sakura: {
    name: 'Sakura Blossom',
    icon: '🌸',
    bg: 'from-slate-950 via-rose-950/40 to-slate-950',
    foliagePrimary: '#DB2777',
    foliageSecondary: '#EC4899',
    foliageAccent: '#F472B6',
    trunkColor: '#881337',
    glowColor: 'rgba(236, 72, 153, 0.25)'
  },
  twilight: {
    name: 'Starlight Twilight',
    icon: '🌌',
    bg: 'from-slate-950 via-indigo-950/50 to-slate-950',
    foliagePrimary: '#4338CA',
    foliageSecondary: '#6366F1',
    foliageAccent: '#818CF8',
    trunkColor: '#312E81',
    glowColor: 'rgba(99, 102, 241, 0.25)'
  }
};

export const WeeklyTreeCanvas = ({ treeData, moments = [] }) => {
  const [selectedNode, setSelectedNode] = useState(null);
  const [themeKey, setThemeKey] = useState('emerald');
  const [filterMood, setFilterMood] = useState('all');

  const theme = CANOPY_THEMES[themeKey] || CANOPY_THEMES.emerald;

  // Extract base tree info
  const actualTree = treeData?.tree || treeData || {};
  const { space_name = 'Memory Space', tree_level = 3, dominant_mood = 'happy', summary_text } = actualTree;

  // Combine moments passed from props OR tree nodes into unified picture bubble nodes
  let rawNodes = [];

  if (moments && moments.length > 0) {
    rawNodes = moments.map((m, idx) => {
      // Find uploaded photo url if available
      let photoUrl = '';
      if (m.photos && m.photos.length > 0) {
        photoUrl = m.photos[0].url || m.photos[0];
      } else if (m.photo_url) {
        photoUrl = m.photo_url;
      } else if (m.photo_urls && m.photo_urls.length > 0) {
        photoUrl = m.photo_urls[0];
      }

      if (!photoUrl || typeof photoUrl !== 'string') {
        photoUrl = DEFAULT_PHOTOS[idx % DEFAULT_PHOTOS.length];
      }

      const dayNames = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
      const createdDate = m.date || m.created_at;
      let dayShort = 'DAY';
      if (createdDate) {
        const d = new Date(createdDate);
        if (!isNaN(d.getTime())) {
          const dayIdx = (d.getDay() + 6) % 7;
          dayShort = dayNames[dayIdx];
        }
      }

      return {
        id: m.id || `mom-${idx}`,
        title: m.title || 'Shared Memory',
        description: m.description || '',
        author: m.user_name || m.author || 'Contributor',
        authorAvatar: m.user_avatar || '',
        mood: (m.mood || 'happy').toLowerCase(),
        category: m.category || 'General',
        location: m.location || '',
        audio_url: m.audio_url || null,
        song: m.song || null,
        created_at: createdDate || new Date().toISOString(),
        day_short: dayShort,
        photo_url: photoUrl
      };
    });
  } else if (actualTree.nodes && actualTree.nodes.length > 0) {
    rawNodes = actualTree.nodes.map((n, idx) => ({
      ...n,
      mood: (n.mood || 'happy').toLowerCase(),
      photo_url: n.photo_url || DEFAULT_PHOTOS[idx % DEFAULT_PHOTOS.length]
    }));
  } else {
    // Fallback default sample nodes
    rawNodes = DEFAULT_PHOTOS.map((photo, i) => ({
      id: `sample-${i}`,
      title: `Memory Moment #${i + 1}`,
      description: 'A wonderful moment captured on the tree.',
      author: 'Family & Friends',
      mood: ['happy', 'excited', 'calm', 'reflective', 'grateful'][i % 5],
      category: 'Memory',
      day_short: ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'][i % 6],
      photo_url: photo
    }));
  }

  // Filter nodes if filterMood selected
  const displayNodes = filterMood === 'all'
    ? rawNodes
    : rawNodes.filter(n => n.mood === filterMood);

  // Assign branch coordinates
  const mappedNodes = displayNodes.map((node, idx) => {
    const pos = BRANCH_POSITIONS[idx % BRANCH_POSITIONS.length];
    return {
      ...node,
      x: pos.x,
      y: pos.y
    };
  });

  return (
    <div className={`bg-gradient-to-b ${theme.bg} text-white border border-slate-800 rounded-3xl p-5 md:p-6 shadow-2xl space-y-5 transition-colors duration-700`}>
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center font-black text-xl shadow-inner">
              {theme.icon}
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>{space_name} — Memory Tree</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-400 text-emerald-950 font-black">
                  {rawNodes.length} Picture Bubbles
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {summary_text || `Interactive canopy displaying ${rawNodes.length} memories with uploaded pictures.`}
              </p>
            </div>
          </div>
        </div>

        {/* Tree Themes & Filter Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Seasonal Canopy Switcher */}
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-2xl border border-slate-800 text-xs">
            {Object.entries(CANOPY_THEMES).map(([key, t]) => (
              <button
                key={key}
                onClick={() => setThemeKey(key)}
                className={`px-2.5 py-1 rounded-xl font-bold flex items-center gap-1 transition ${
                  themeKey === key ? 'bg-emerald-500 text-emerald-950 shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
                title={t.name}
              >
                <span>{t.icon}</span>
                <span className="hidden sm:inline text-[11px]">{t.name.split(' ')[1] || t.name}</span>
              </button>
            ))}
          </div>

          {/* Mood Filter */}
          <select
            value={filterMood}
            onChange={(e) => setFilterMood(e.target.value)}
            className="bg-slate-900/80 border border-slate-800 text-xs font-bold text-slate-200 rounded-2xl px-3 py-1.5 focus:outline-none focus:border-emerald-500"
          >
            <option value="all">All Moods</option>
            <option value="happy">😊 Happy</option>
            <option value="excited">🎉 Excited</option>
            <option value="calm">🌿 Calm</option>
            <option value="reflective">🌙 Reflective</option>
            <option value="grateful">✨ Grateful</option>
          </select>
        </div>
      </div>

      {/* SVG Interactive Lush Memory Tree Stage */}
      <div 
        className="relative bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 min-h-[460px] flex items-center justify-center overflow-hidden shadow-inner group"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 30%, ${theme.glowColor} 0%, transparent 70%)`
        }}
      >
        {/* Floating Fireflies Background Effect */}
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 rounded-full bg-amber-300 animate-ping" />
          <div className="absolute top-1/3 right-1/4 w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-sky-300 animate-ping" />
        </div>

        <svg viewBox="0 0 600 420" className="w-full max-w-3xl h-auto drop-shadow-2xl selection:bg-none">
          <defs>
            {/* Dynamic ClipPath circles for uploaded picture bubbles */}
            {mappedNodes.map((node, i) => (
              <clipPath key={`clip-${node.id || i}`} id={`tree-bubble-clip-${node.id || i}`}>
                <circle cx="0" cy="0" r="24" />
              </clipPath>
            ))}

            {/* Glowing Drop Shadows */}
            <filter id="tree-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000000" floodOpacity="0.75" />
            </filter>

            {/* Linear Gradient for Trunk */}
            <linearGradient id="trunk-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#92400E" />
              <stop offset="50%" stopColor="#78350F" />
              <stop offset="100%" stopColor="#451A03" />
            </linearGradient>

            {/* Radial Gradient for Foliage Canopy Blobs */}
            <radialGradient id="foliage-primary-grad" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={theme.foliageAccent} stopOpacity="0.9" />
              <stop offset="70%" stopColor={theme.foliageSecondary} stopOpacity="0.75" />
              <stop offset="100%" stopColor={theme.foliagePrimary} stopOpacity="0.4" />
            </radialGradient>
          </defs>

          {/* TREE ROOTS */}
          <path d="M 270 420 Q 250 395 210 410" fill="none" stroke="#451A03" strokeWidth="12" strokeLinecap="round" />
          <path d="M 330 420 Q 350 395 390 410" fill="none" stroke="#451A03" strokeWidth="12" strokeLinecap="round" />

          {/* MAIN TRUNK */}
          <path
            d="M 300 420 C 305 320, 275 240, 300 160 C 315 110, 280 70, 270 50"
            fill="none"
            stroke="url(#trunk-grad)"
            strokeWidth="28"
            strokeLinecap="round"
          />
          {/* Trunk Bark Texture Lines */}
          <path d="M 296 400 C 300 330, 280 260, 296 180" fill="none" stroke="#B45309" strokeWidth="3" opacity="0.6" />
          <path d="M 304 390 C 308 320, 290 250, 304 190" fill="none" stroke="#371B07" strokeWidth="3" opacity="0.7" />

          {/* PRIMARY & SECONDARY CURVED BRANCHES */}
          {/* Left Branch Group */}
          <path d="M 290 270 C 220 240, 160 210, 130 200" fill="none" stroke="url(#trunk-grad)" strokeWidth="16" strokeLinecap="round" />
          <path d="M 210 235 C 180 270, 175 250, 170 260" fill="none" stroke="url(#trunk-grad)" strokeWidth="10" strokeLinecap="round" />
          <path d="M 170 215 C 130 160, 120 150, 110 140" fill="none" stroke="url(#trunk-grad)" strokeWidth="9" strokeLinecap="round" />
          <path d="M 275 180 C 210 140, 195 135, 190 130" fill="none" stroke="url(#trunk-grad)" strokeWidth="12" strokeLinecap="round" />
          <path d="M 230 150 C 190 90, 220 85, 230 80" fill="none" stroke="url(#trunk-grad)" strokeWidth="10" strokeLinecap="round" />

          {/* Right Branch Group */}
          <path d="M 305 240 C 380 210, 440 195, 470 180" fill="none" stroke="url(#trunk-grad)" strokeWidth="15" strokeLinecap="round" />
          <path d="M 390 210 C 420 240, 425 245, 430 250" fill="none" stroke="url(#trunk-grad)" strokeWidth="10" strokeLinecap="round" />
          <path d="M 430 195 C 470 140, 480 130, 490 120" fill="none" stroke="url(#trunk-grad)" strokeWidth="8" strokeLinecap="round" />
          <path d="M 290 150 C 360 120, 395 115, 410 110" fill="none" stroke="url(#trunk-grad)" strokeWidth="12" strokeLinecap="round" />
          <path d="M 340 130 C 360 90, 365 88, 370 85" fill="none" stroke="url(#trunk-grad)" strokeWidth="9" strokeLinecap="round" />

          {/* LUSH FOLIAGE CANOPY BLOBS */}
          <circle cx="300" cy="70" r="58" fill="url(#foliage-primary-grad)" />
          <circle cx="190" cy="130" r="54" fill="url(#foliage-primary-grad)" />
          <circle cx="410" cy="110" r="56" fill="url(#foliage-primary-grad)" />
          <circle cx="130" cy="200" r="50" fill="url(#foliage-primary-grad)" />
          <circle cx="470" cy="180" r="52" fill="url(#foliage-primary-grad)" />
          <circle cx="230" cy="80" r="46" fill="url(#foliage-primary-grad)" />
          <circle cx="370" cy="85" r="48" fill="url(#foliage-primary-grad)" />
          <circle cx="170" cy="260" r="44" fill="url(#foliage-primary-grad)" />
          <circle cx="430" cy="250" r="44" fill="url(#foliage-primary-grad)" />

          {/* INTERACTIVE PICTURE BUBBLES ON BRANCHES */}
          {mappedNodes.map((node, i) => {
            const isSelected = selectedNode?.id === node.id;
            const moodColor = MOOD_COLORS[node.mood] || '#38BDF8';
            const moodEmoji = MOOD_EMOJIS[node.mood] || '✨';
            const photoUrl = node.photo_url || DEFAULT_PHOTOS[i % DEFAULT_PHOTOS.length];

            return (
              <g
                key={node.id || i}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer transition-all duration-300 hover:scale-125 group/bubble"
                filter="url(#tree-glow)"
                onClick={() => setSelectedNode(node)}
              >
                {/* Branch Hanger String / Stem */}
                <line x1="0" y1="-32" x2="0" y2="-26" stroke="#B45309" strokeWidth="2" strokeDasharray="2 2" />

                {/* Pulsing Selection Halo */}
                {isSelected && (
                  <circle
                    r="32"
                    fill="none"
                    stroke={moodColor}
                    strokeWidth="3.5"
                    className="animate-ping"
                    opacity="0.8"
                  />
                )}

                {/* Outer Glow Ring */}
                <circle
                  r="28"
                  fill="#0F172A"
                  stroke={moodColor}
                  strokeWidth="3.5"
                  className="transition-all duration-300 group-hover/bubble:stroke-white"
                />

                {/* UPLOADED PICTURE CLIP */}
                <image
                  href={photoUrl}
                  x="-24"
                  y="-24"
                  width="48"
                  height="48"
                  clipPath={`url(#tree-bubble-clip-${node.id || i})`}
                  preserveAspectRatio="xMidYMid slice"
                />

                {/* Glassy Inner Shadow Rim */}
                <circle
                  r="24"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  opacity="0.4"
                />

                {/* Mood Emoji Badge (Top Right) */}
                <g transform="translate(16, -16)">
                  <circle r="10" fill="#0F172A" stroke={moodColor} strokeWidth="2" />
                  <text textAnchor="middle" dy="3.5" fontSize="10">
                    {moodEmoji}
                  </text>
                </g>

                {/* Author Avatar Mini Badge (Top Left) */}
                {node.authorAvatar && (
                  <g transform="translate(-16, -16)">
                    <clipPath id={`avatar-clip-${node.id || i}`}>
                      <circle cx="0" cy="0" r="9" />
                    </clipPath>
                    <circle r="10" fill="#0F172A" stroke="#FFFFFF" strokeWidth="1.5" />
                    <image
                      href={node.authorAvatar}
                      x="-9"
                      y="-9"
                      width="18"
                      height="18"
                      clipPath={`url(#avatar-clip-${node.id || i})`}
                      preserveAspectRatio="xMidYMid slice"
                    />
                  </g>
                )}

                {/* Day Tag Pill under Bubble */}
                <g transform="translate(0, 34)">
                  <rect
                    x="-20"
                    y="-10"
                    width="40"
                    height="18"
                    rx="9"
                    fill="#0F172A"
                    stroke={moodColor}
                    strokeWidth="1.5"
                  />
                  <text
                    textAnchor="middle"
                    dy="3"
                    fontSize="9.5"
                    fontWeight="900"
                    fill="#FFFFFF"
                    className="tracking-wider"
                  >
                    {node.day_short || 'MON'}
                  </text>
                </g>
              </g>
            );
          })}
        </svg>

        {/* Selected Picture Bubble Detailed Popover Card */}
        {selectedNode && (
          <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 border border-emerald-500/40 rounded-3xl p-4 md:p-5 shadow-2xl backdrop-blur-md animate-fade-in flex flex-col md:flex-row items-center justify-between gap-5 text-xs z-30">
            <div className="flex items-start md:items-center gap-4 w-full">
              {/* Full Uploaded Photo Thumbnail */}
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl overflow-hidden border-2 border-emerald-400 shrink-0 shadow-lg relative bg-slate-950">
                <img
                  src={selectedNode.photo_url}
                  alt={selectedNode.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[11px] border border-emerald-500/30 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {selectedNode.day_short} • {selectedNode.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] border border-slate-700 flex items-center gap-1">
                    <User className="w-3 h-3 text-emerald-400" />
                    {selectedNode.author}
                  </span>
                </div>

                <h3 className="font-extrabold text-white text-base truncate">{selectedNode.title}</h3>
                
                {selectedNode.description && (
                  <p className="text-xs text-slate-300 line-clamp-2 italic">
                    "{selectedNode.description}"
                  </p>
                )}

                {/* Mood & Audio Attachments */}
                <div className="flex items-center gap-3 pt-1 text-[11px] text-slate-400 flex-wrap">
                  <span className="capitalize text-amber-300 font-bold flex items-center gap-1">
                    {MOOD_EMOJIS[selectedNode.mood] || '✨'} Mood: {selectedNode.mood}
                  </span>
                  
                  {selectedNode.location && (
                    <span className="text-teal-300 flex items-center gap-1">
                      <Navigation className="w-3 h-3" />
                      {selectedNode.location}
                    </span>
                  )}

                  {selectedNode.audio_url && (
                    <span className="text-rose-400 font-bold flex items-center gap-1">
                      <Volume2 className="w-3 h-3 animate-bounce" />
                      Voice Note Attached
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition self-end md:self-center shrink-0"
              title="Close Preview"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Picture Bubble Legend & Quick Tips */}
      <div className="flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 pt-2 border-t border-white/10 gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Click any picture bubble to view uploaded photo details & notes</span>
        </div>

        <div className="flex items-center gap-3 flex-wrap text-[11px]">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Happy</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Excited</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span> Calm</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span> Reflective</span>
        </div>
      </div>
    </div>
  );
};
