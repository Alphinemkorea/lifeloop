import React, { useState } from 'react';
import { TreePine, Sparkles, Image as ImageIcon, Heart, X, User } from 'lucide-react';

const MOOD_COLORS = {
  happy: '#F59E0B',
  excited: '#10B981',
  calm: '#38BDF8',
  reflective: '#A855F7',
  grateful: '#EC4899'
};

const MOOD_EMOJIS = {
  happy: '😊',
  excited: '🎉',
  calm: '🌿',
  reflective: '🌙',
  grateful: '✨'
};

const DEFAULT_PHOTOS = [
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80'
];

export const WeeklyTreeCanvas = ({ treeData }) => {
  const [selectedNode, setSelectedNode] = useState(null);

  if (!treeData) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-3xl">
        Loading memory tree canvas...
      </div>
    );
  }

  const actualTree = treeData?.tree || treeData || {};
  const { space_name, tree_level, moments_count, dominant_mood, summary_text, nodes = [] } = actualTree;

  return (
    <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
      {/* Header stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <TreePine className="w-6 h-6 text-emerald-400" />
            <h2 className="text-lg font-black tracking-tight">{space_name} — Memory Tree</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">{summary_text}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="px-3 py-1.5 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs">
            <span className="text-slate-400 font-medium">Tree Growth Level: </span>
            <span className="font-bold text-amber-400">Level {tree_level} / 5</span>
          </div>

          <div className="px-3 py-1.5 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs">
            <span className="text-slate-400 font-medium">Dominant Mood: </span>
            <span className="font-bold text-emerald-400 uppercase">{dominant_mood}</span>
          </div>
        </div>
      </div>

      {/* SVG Interactive Memory Tree with Picture Bubbles */}
      <div className="relative bg-slate-950/60 border border-slate-800/80 rounded-2xl p-4 min-h-[420px] flex items-center justify-center overflow-hidden">
        <svg viewBox="0 0 600 400" className="w-full max-w-2xl h-auto drop-shadow-2xl">
          <defs>
            {/* Circular ClipPaths for Picture Bubbles */}
            {nodes.map((node, i) => (
              <clipPath key={`clip-${node.id || i}`} id={`bubble-clip-${node.id || i}`}>
                <circle cx="0" cy="0" r="22" />
              </clipPath>
            ))}

            {/* Drop Shadow filter */}
            <filter id="bubble-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000000" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Trunk */}
          <path
            d="M 300 400 C 300 300, 280 250, 300 180 C 320 120, 270 80, 250 50"
            fill="none"
            stroke="#8B5A2B"
            strokeWidth="24"
            strokeLinecap="round"
          />
          {/* Main Branches */}
          <path
            d="M 290 260 C 220 230, 180 200, 140 160"
            fill="none"
            stroke="#8B5A2B"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M 305 210 C 380 180, 420 150, 470 120"
            fill="none"
            stroke="#8B5A2B"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M 285 140 C 230 110, 180 90, 150 70"
            fill="none"
            stroke="#8B5A2B"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M 295 110 C 340 90, 390 85, 430 85"
            fill="none"
            stroke="#8B5A2B"
            strokeWidth="8"
            strokeLinecap="round"
          />

          {/* Leaves & Soft Canopy Foliage Blobs */}
          <circle cx="250" cy="50" r="48" fill="#10B981" opacity="0.3" />
          <circle cx="140" cy="160" r="52" fill="#3B82F6" opacity="0.25" />
          <circle cx="470" cy="120" r="56" fill="#F59E0B" opacity="0.3" />
          <circle cx="150" cy="70" r="42" fill="#EC4899" opacity="0.25" />
          <circle cx="310" cy="70" r="45" fill="#10B981" opacity="0.2" />

          {/* Interactive Picture Bubbles */}
          {nodes.map((node, i) => {
            const isSelected = selectedNode?.id === node.id;
            const moodColor = MOOD_COLORS[node.mood] || '#38BDF8';
            const moodEmoji = MOOD_EMOJIS[node.mood] || '✨';
            const photoUrl = node.photo_url || DEFAULT_PHOTOS[i % DEFAULT_PHOTOS.length];

            return (
              <g
                key={node.id || i}
                transform={`translate(${node.x}, ${node.y})`}
                className="cursor-pointer transition-all duration-300 hover:scale-125"
                filter="url(#bubble-shadow)"
                onClick={() => setSelectedNode(node)}
              >
                {/* Selection Pulse Ring */}
                {isSelected && (
                  <circle
                    r="28"
                    fill="none"
                    stroke={moodColor}
                    strokeWidth="3"
                    className="animate-ping"
                    opacity="0.6"
                  />
                )}

                {/* Outer Colored Frame Circle */}
                <circle
                  r="24"
                  fill="#1E293B"
                  stroke={moodColor}
                  strokeWidth="3"
                />

                {/* Photo Thumbnail Image */}
                <image
                  href={photoUrl}
                  x="-22"
                  y="-22"
                  width="44"
                  height="44"
                  clipPath={`url(#bubble-clip-${node.id || i})`}
                  preserveAspectRatio="xMidYMid slice"
                />

                {/* Glossy Overlay Highlight */}
                <circle
                  r="22"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="1.5"
                  opacity="0.5"
                />

                {/* Mood Mini Badge */}
                <g transform="translate(14, -14)">
                  <circle r="9" fill="#0F172A" stroke={moodColor} strokeWidth="1.5" />
                  <text textAnchor="middle" dy="3" fontSize="9">
                    {moodEmoji}
                  </text>
                </g>

                {/* Day Pill Badge under Bubble */}
                <g transform="translate(0, 31)">
                  <rect
                    x="-18"
                    y="-9"
                    width="36"
                    height="16"
                    rx="8"
                    fill="#0F172A"
                    stroke={moodColor}
                    strokeWidth="1.5"
                  />
                  <text
                    textAnchor="middle"
                    dy="3"
                    fontSize="9"
                    fontWeight="800"
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

        {/* Selected Picture Bubble Detailed Popover */}
        {selectedNode && (
          <div className="absolute bottom-4 left-4 right-4 bg-slate-900/95 border border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-md animate-fade-in flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3.5 w-full sm:w-auto">
              {/* Thumbnail preview */}
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-slate-700 shrink-0 shadow-sm relative">
                <img
                  src={selectedNode.photo_url || DEFAULT_PHOTOS[0]}
                  alt={selectedNode.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-extrabold text-amber-300 text-sm truncate">{selectedNode.title}</h4>
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px] border border-slate-700">
                    by {selectedNode.author}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 font-extrabold text-[10px]">
                    📅 {selectedNode.day_full || 'Monday'}
                  </span>
                  <span className="capitalize text-emerald-400 font-semibold">
                    {MOOD_EMOJIS[selectedNode.mood] || '✨'} {selectedNode.mood}
                  </span>
                  <span>•</span>
                  <span className="capitalize">{selectedNode.category || 'General'}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedNode(null)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition self-end sm:self-center shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Picture Bubble Legend */}
      <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800/80 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Click any picture bubble on the tree branches to view moment details</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Happy</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Excited</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block"></span> Calm</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span> Reflective</span>
        </div>
      </div>
    </div>
  );
};

