import React, { useState } from 'react';
import { Move, RotateCw, Sticker, Image as ImageIcon, Plus, Trash2, Download, Layers, Palette } from 'lucide-react';

const STICKERS = ['🌸', '⭐', '🌿', '📸', '💖', '📌', '🎨', '🎵', '🌻', '✈️', '💌', '☕'];

export const FreeformScrapbookCanvas = ({ spaceName = "Memory Space", moments = [] }) => {
  const [bgTexture, setBgTexture] = useState('corkboard'); // corkboard, paper, grid, dark
  
  // Default collage items initialized from space moments
  const [items, setItems] = useState(() => {
    const initial = moments.slice(0, 6).map((m, i) => ({
      id: `item-${i}`,
      type: 'polaroid',
      title: m.title,
      photoUrl: m.photos?.[0]?.url || 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80',
      x: 40 + (i % 3) * 220,
      y: 60 + Math.floor(i / 3) * 200,
      rotation: (i % 2 === 0 ? 1 : -1) * (Math.random() * 8 + 2),
      sticker: STICKERS[i % STICKERS.length],
      note: m.description || 'Wonderful memory captured!'
    }));

    if (initial.length === 0) {
      initial.push({
        id: 'item-demo-1',
        type: 'polaroid',
        title: 'Summer Getaway',
        photoUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80',
        x: 60,
        y: 60,
        rotation: -4,
        sticker: '🏖️',
        note: 'Warm breeze and sunny smiles.'
      });
      initial.push({
        id: 'item-demo-2',
        type: 'polaroid',
        title: 'Coffee & Chill',
        photoUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=400&q=80',
        x: 320,
        y: 80,
        rotation: 6,
        sticker: '☕',
        note: 'Best morning vibes!'
      });
    }

    return initial;
  });

  const [activeDraggingId, setActiveDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e, id) => {
    const item = items.find(it => it.id === id);
    if (!item) return;
    setActiveDraggingId(id);
    setDragOffset({
      x: e.clientX - item.x,
      y: e.clientY - item.y
    });
  };

  const handleMouseMove = (e) => {
    if (!activeDraggingId) return;
    setItems(prev => prev.map(item => {
      if (item.id === activeDraggingId) {
        return {
          ...item,
          x: Math.max(0, e.clientX - dragOffset.x),
          y: Math.max(0, e.clientY - dragOffset.y)
        };
      }
      return item;
    }));
  };

  const handleMouseUp = () => {
    setActiveDraggingId(null);
  };

  const rotateItem = (id) => {
    setItems(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, rotation: (item.rotation + 15) % 360 };
      }
      return item;
    }));
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const addStickerNote = (sticker) => {
    const newItem = {
      id: `sticker-${Date.now()}`,
      type: 'note',
      title: 'Scrapbook Note',
      photoUrl: '',
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 150,
      rotation: (Math.random() - 0.5) * 20,
      sticker: sticker,
      note: 'Added to memory board ✨'
    };
    setItems(prev => [...prev, newItem]);
  };

  return (
    <div className="glass-panel rounded-3xl p-5 border shadow-md space-y-4 select-none">
      {/* Canvas Header & Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-950 flex items-center justify-center font-black text-lg">
            🖼️
          </div>
          <div>
            <h3 className="font-extrabold text-base text-blue-950 flex items-center gap-2">
              <span>Freeform Drag-and-Drop Canvas</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black">
                {items.length} Elements
              </span>
            </h3>
            <p className="text-xs text-slate-500">Drag polaroids, add stickers, and customize your memory board</p>
          </div>
        </div>

        {/* Toolbar controls */}
        <div className="flex items-center gap-2">
          {/* Background Texture Selector */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold border">
            {['corkboard', 'paper', 'grid', 'dark'].map((tex) => (
              <button
                key={tex}
                onClick={() => setBgTexture(tex)}
                className={`px-2.5 py-1 rounded-lg capitalize transition ${
                  bgTexture === tex ? 'bg-blue-900 text-white' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tex}
              </button>
            ))}
          </div>

          {/* Quick Sticker Palette */}
          <div className="flex items-center gap-1 overflow-x-auto">
            {STICKERS.slice(0, 5).map((stk) => (
              <button
                key={stk}
                onClick={() => addStickerNote(stk)}
                className="w-8 h-8 rounded-xl glass-card hover:bg-amber-100/50 flex items-center justify-center text-base transition hover:scale-110"
                title={`Add ${stk} Sticker Note`}
              >
                {stk}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Drag-and-Drop Stage */}
      <div
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className={`relative h-[550px] rounded-2xl overflow-hidden border border-amber-900/20 shadow-inner ${
          bgTexture === 'corkboard'
            ? 'bg-amber-900/10 bg-[radial-gradient(#b45309_1px,transparent_1px)] [background-size:16px_16px]'
            : bgTexture === 'paper'
            ? 'bg-amber-50/70 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:24px_24px]'
            : bgTexture === 'grid'
            ? 'bg-slate-900 text-white bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] [background-size:32px_32px]'
            : 'bg-slate-950 text-white'
        }`}
      >
        {/* Title Watermark */}
        <div className="absolute top-4 left-6 pointer-events-none opacity-30 font-black text-2xl tracking-widest uppercase font-serif text-slate-800 dark:text-slate-200">
          {spaceName} Collage
        </div>

        {/* Board Items */}
        {items.map((item) => (
          <div
            key={item.id}
            onMouseDown={(e) => handleMouseDown(e, item.id)}
            style={{
              left: `${item.x}px`,
              top: `${item.y}px`,
              transform: `rotate(${item.rotation}deg)`,
            }}
            className={`absolute cursor-move transition-shadow duration-150 group z-10 hover:z-30 ${
              activeDraggingId === item.id ? 'shadow-2xl scale-105 z-40' : 'shadow-md'
            }`}
          >
            {item.type === 'polaroid' ? (
              /* Polaroid Style Card */
              <div className="w-56 bg-white p-3 rounded-xl border border-slate-200/80 shadow-lg space-y-2 relative">
                {/* Tape Strip Accent */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-5 bg-amber-200/80 border border-amber-300 transform -rotate-2 opacity-90 shadow-xs" />
                
                {/* Sticker Badge */}
                <div className="absolute -top-2 -right-2 text-2xl drop-shadow-md">
                  {item.sticker}
                </div>

                <div className="h-44 rounded-lg overflow-hidden bg-slate-100">
                  <img
                    src={item.photoUrl}
                    alt={item.title}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </div>

                <div className="space-y-1 pt-1">
                  <h4 className="font-bold text-xs text-slate-900 truncate font-serif">{item.title}</h4>
                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight font-sans italic">
                    "{item.note}"
                  </p>
                </div>

                {/* Control Action overlay on hover */}
                <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => { e.stopPropagation(); rotateItem(item.id); }}
                    className="p-1.5 rounded-lg bg-slate-900/80 text-white hover:bg-slate-950 transition"
                    title="Rotate 15°"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                    className="p-1.5 rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ) : (
              /* Sticker / Note Card */
              <div className="bg-amber-100 border border-amber-300 text-amber-950 p-4 rounded-2xl shadow-md max-w-[200px] space-y-1 relative">
                <div className="text-3xl">{item.sticker}</div>
                <p className="text-xs font-bold leading-snug">{item.note}</p>
                
                <div className="absolute top-1 right-1 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    onClick={(e) => { e.stopPropagation(); rotateItem(item.id); }}
                    className="p-1 rounded-md bg-amber-900/20 text-amber-950 hover:bg-amber-900/30"
                  >
                    <RotateCw className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                    className="p-1 rounded-md bg-rose-500 text-white"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
