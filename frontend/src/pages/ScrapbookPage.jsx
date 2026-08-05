import React, { useState, useRef } from 'react';
import { useFetch } from '../hooks/useFetch.js';
import { useAuth } from '../hooks/useAuth.js';
import { toPng } from 'html-to-image';
import {
  BookOpen,
  Download,
  Printer,
  Sparkles,
  Palette,
  Check,
  RotateCcw,
  Tag,
  Plus,
  Trash2,
  Heart,
  Image as ImageIcon,
  Share2
} from 'lucide-react';

const STICKERS = [
  { id: 'memory', label: '✨ Memory of the Week', color: 'bg-amber-100 text-amber-900 border-amber-300' },
  { id: 'vibes', label: '🌿 Good Vibes', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
  { id: 'favorite', label: '❤️ Favorites', color: 'bg-pink-100 text-pink-900 border-pink-300' },
  { id: 'joy', label: '🎉 Pure Joy', color: 'bg-purple-100 text-purple-900 border-purple-300' },
  { id: 'highlight', label: '🌟 Weekly Highlight', color: 'bg-blue-100 text-blue-900 border-blue-300' },
  { id: 'snapshot', label: '📸 Snapshot', color: 'bg-orange-100 text-orange-900 border-orange-300' }
];

const BOARD_THEMES = [
  {
    id: 'craft-paper',
    name: 'Craft Paper',
    bgClass: 'bg-[#e8decb] text-[#3e2723]',
    cardBg: 'bg-[#fffdfa]',
    tapeBg: 'bg-amber-200/80',
    borderClass: 'border-[#d4c5a9]'
  },
  {
    id: 'cream-linen',
    name: 'Cream Linen',
    bgClass: 'bg-[#faf7f2] text-[#2c2c2c]',
    cardBg: 'bg-white',
    tapeBg: 'bg-rose-100/90',
    borderClass: 'border-[#eae3d9]'
  },
  {
    id: 'corkboard',
    name: 'Corkboard',
    bgClass: 'bg-[#2b1810] text-[#f5f5f5]',
    cardBg: 'bg-[#fffefb]',
    tapeBg: 'bg-yellow-100/80',
    borderClass: 'border-[#4a2e20]'
  },
  {
    id: 'grid-paper',
    name: 'Grid Notebook',
    bgClass: 'bg-[#f4f6f9] text-[#1e293b]',
    cardBg: 'bg-white',
    tapeBg: 'bg-sky-200/80',
    borderClass: 'border-slate-300'
  },
  {
    id: 'midnight-velvet',
    name: 'Midnight Velvet',
    bgClass: 'bg-[#0f172a] text-[#f8fafc]',
    cardBg: 'bg-[#1e293b]',
    tapeBg: 'bg-pink-500/30',
    borderClass: 'border-slate-800'
  }
];

export const ScrapbookPage = () => {
  const { user } = useAuth();
  const boardRef = useRef(null);

  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  const [selectedTheme, setSelectedTheme] = useState('craft-paper');
  const [scrapbookTitle, setScrapbookTitle] = useState('Our Weekly Memory Scrapbook');
  const [journalNote, setJournalNote] = useState('Looking back on our wonderful weekly moments logged together. Each picture tells a story of happiness and connection making us never forget our people!');
  const [activeStickers, setActiveStickers] = useState(['memory', 'vibes', 'favorite']);
  const [downloading, setDownloading] = useState(false);
  const [excludedMomentIds, setExcludedMomentIds] = useState([]);

  // Fetch spaces for filter dropdown
  const { data: spacesRes } = useFetch(user ? `/api/spaces?user_id=${user.id}` : '');
  const spaces = spacesRes?.data || [];

  // Fetch moments for the selected space (or all)
  const momentsEndpoint = selectedSpaceId
    ? `/api/moments?space_id=${selectedSpaceId}&per_page=30`
    : '/api/moments?per_page=30';
  const { data: momentsRes, loading: momentsLoading } = useFetch(momentsEndpoint);
  const moments = momentsRes?.data || [];

  const themeObj = BOARD_THEMES.find(t => t.id === selectedTheme) || BOARD_THEMES[0];

  const handleToggleSticker = (stickerId) => {
    if (activeStickers.includes(stickerId)) {
      setActiveStickers(activeStickers.filter(s => s !== stickerId));
    } else {
      setActiveStickers([...activeStickers, stickerId]);
    }
  };

  const handleToggleMoment = (mId) => {
    if (excludedMomentIds.includes(mId)) {
      setExcludedMomentIds(excludedMomentIds.filter(id => id !== mId));
    } else {
      setExcludedMomentIds([...excludedMomentIds, mId]);
    }
  };

  const handleDownloadCollage = async () => {
    if (!boardRef.current) return;
    try {
      setDownloading(true);
      const dataUrl = await toPng(boardRef.current, {
        cacheBust: true,
        quality: 0.95,
        style: { transform: 'scale(1)' }
      });
      const link = document.createElement('a');
      link.download = `lifeloop-scrapbook-collage-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download scrapbook image:', err);
      alert('Could not download collage. You can also use the Print button to save as PDF!');
    } finally {
      setDownloading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const visibleMoments = moments.filter(m => !excludedMomentIds.includes(m.id));

  // Default fallback polaroid photos if moment doesn't have image
  const fallbackPhotos = [
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=500&auto=format&fit=crop&q=80'
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 text-slate-800">
      {/* Print stylesheet to isolate board when printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-scrapbook-board, #printable-scrapbook-board * {
            visibility: visible;
          }
          #printable-scrapbook-board {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            padding: 20px !important;
            box-shadow: none !important;
            background-color: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Control Bar Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6 no-print">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-50 text-pink-600 border border-pink-100">
              <BookOpen className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-extrabold text-blue-950">Weekly Memory Scrapbook</h1>
          </div>
          <p className="text-xs text-slate-500">
            Arrange your weekly moments into a physical-style scrapbook collage board. Download as an image or print anytime!
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <button
            onClick={handleDownloadCollage}
            disabled={downloading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-sm transition disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Capturing Collage...' : 'Download Picture Collage'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            <span>Print Scrapbook</span>
          </button>
        </div>
      </div>

      {/* Customization Toolbar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6 no-print">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Space Filter */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <span>Filter Space:</span>
            </label>
            <select
              value={selectedSpaceId}
              onChange={(e) => setSelectedSpaceId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:bg-white focus:border-blue-900 outline-none transition"
            >
              <option value="">All Spaces Memories</option>
              {spaces.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Selector */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-pink-600" />
              <span>Scrapbook Board Texture:</span>
            </label>
            <div className="flex items-center gap-2 flex-wrap">
              {BOARD_THEMES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTheme(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition ${selectedTheme === t.id
                      ? 'border-pink-600 bg-pink-50 text-pink-900 shadow-2xs ring-2 ring-pink-500/20'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* Edit Title */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700">Scrapbook Title:</label>
            <input
              type="text"
              value={scrapbookTitle}
              onChange={(e) => setScrapbookTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold bg-slate-50 focus:bg-white focus:border-blue-900 outline-none"
            />
          </div>
        </div>

        {/* Decorative Stamps & Stickers Toggle */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Add Decorative Stamps & Badges:</span>
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            {STICKERS.map((st) => {
              const active = activeStickers.includes(st.id);
              return (
                <button
                  key={st.id}
                  onClick={() => handleToggleSticker(st.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold border transition flex items-center gap-1.5 ${active
                      ? `${st.color} shadow-2xs`
                      : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                    }`}
                >
                  {active && <Check className="w-3.5 h-3.5" />}
                  <span>{st.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Printable / Downloadable Scrapbook Canvas Board */}
      <div
        id="printable-scrapbook-board"
        ref={boardRef}
        className={`rounded-3xl p-8 md:p-12 border shadow-xl transition-all duration-300 space-y-8 relative overflow-hidden ${themeObj.bgClass} ${themeObj.borderClass}`}
      >
        {/* Board Top Header */}
        <div className="text-center space-y-3 relative z-10 pb-6 border-b border-current/10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-current/5 border border-current/10 text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>LifeLoop Weekly Collage</span>
          </div>

          <h2 className="text-2xl md:text-4xl font-black tracking-tight font-serif italic">
            {scrapbookTitle}
          </h2>

          <p className="text-xs md:text-sm font-medium max-w-2xl mx-auto opacity-80 leading-relaxed italic">
            "{journalNote}"
          </p>

          {/* Active Stamps Display on Top of Scrapbook */}
          <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
            {activeStickers.map((stId) => {
              const st = STICKERS.find((s) => s.id === stId);
              if (!st) return null;
              return (
                <span
                  key={st.id}
                  className={`px-3 py-1 rounded-full text-xs font-black border shadow-2xs transform -rotate-1 ${st.color}`}
                >
                  {st.label}
                </span>
              );
            })}
          </div>
        </div>

        {/* Moments Polaroid Grid */}
        {momentsLoading ? (
          <div className="p-12 text-center text-xs opacity-60">Loading scrapbook moments...</div>
        ) : visibleMoments.length === 0 ? (
          <div className="p-12 text-center text-xs opacity-60">
            No moments in collage yet. Select moments below to display!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 relative z-10">
            {visibleMoments.map((m, idx) => {
              const photo = m.photos?.[0]?.url || fallbackPhotos[idx % fallbackPhotos.length];
              const rotation = (idx % 2 === 0 ? 1 : -1) * ((idx % 3) + 1); // Alternating polaroid tilts

              // Days of week
              const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
              const dayName = days[idx % 7];

              return (
                <div
                  key={m.id}
                  style={{ transform: `rotate(${rotation}deg)` }}
                  className={`p-4 rounded-2xl ${themeObj.cardBg} border border-black/10 shadow-lg relative group transition hover:scale-105 duration-300 text-slate-800`}
                >
                  {/* Washi Tape Strip Graphic on Top */}
                  <div
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 w-20 h-6 ${themeObj.tapeBg} opacity-80 rounded-xs shadow-2xs border border-black/5 transform -rotate-2 z-20`}
                  />

                  {/* Photo Container */}
                  <div className="aspect-4/3 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 mb-3 relative group">
                    <img
                      src={photo}
                      alt={m.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-extrabold backdrop-blur-xs">
                      📅 {dayName}
                    </div>
                  </div>

                  {/* Polaroid Handwritten Caption */}
                  <div className="space-y-1.5 px-1">
                    <h4 className="font-extrabold text-sm text-slate-900 leading-tight">
                      {m.title}
                    </h4>

                    {m.description && (
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed italic">
                        "{m.description}"
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-500 font-medium">
                      <span>by {m.author_name || 'Friend'}</span>
                      <span className="capitalize px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                        {m.mood || 'happy'}
                      </span>
                    </div>
                  </div>

                  {/* Hide Button on Hover */}
                  <button
                    onClick={() => handleToggleMoment(m.id)}
                    className="no-print absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition shadow-md"
                    title="Remove from collage"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Board Bottom Handwritten Journal Section */}
        <div className="pt-6 border-t border-current/10 relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs opacity-80">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
            <span className="font-bold">LifeLoop Memories • Created for Space Members</span>
          </div>

          <span>Week 31, 2026 Collection</span>
        </div>
      </div>

      {/* Moment Selector Tray (To add back hidden moments or customize notes) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 no-print">
        <h3 className="text-sm font-extrabold text-blue-950 flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-blue-900" />
          <span>Manage Scrapbook Items ({moments.length - excludedMomentIds.length} included)</span>
        </h3>

        <div className="flex items-center gap-2 flex-wrap">
          {moments.map((m) => {
            const isExcluded = excludedMomentIds.includes(m.id);
            return (
              <button
                key={m.id}
                onClick={() => handleToggleMoment(m.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-2 ${!isExcluded
                    ? 'bg-blue-50 text-blue-900 border-blue-200 shadow-2xs'
                    : 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                  }`}
              >
                <span>{m.title}</span>
                {!isExcluded ? (
                  <Check className="w-3.5 h-3.5 text-blue-900" />
                ) : (
                  <Plus className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
