import React, { useState } from 'react';
import { MapPin, Navigation, Compass, Sparkles, Filter, X } from 'lucide-react';

const POPULAR_LOCATIONS = [
  { name: 'All World', lat: 20, lng: 0 },
  { name: 'North America', lat: 40, lng: -95 },
  { name: 'Europe', lat: 50, lng: 15 },
  { name: 'Asia', lat: 35, lng: 105 },
  { name: 'Home & Local', lat: 10, lng: 10 }
];

export const GeotaggedMemoryMap = ({ moments = [], onSelectMoment }) => {
  const [selectedLocationFilter, setSelectedLocationFilter] = useState('All World');
  const [activePinMoment, setActivePinMoment] = useState(null);

  // Filter moments that have a location specified (or map mock coordinates for moments)
  const geotaggedMoments = moments.map((m, idx) => {
    // Generate deterministic lat/lng coordinates based on location string or index if no exact coords exist
    let xPercent = 20 + ((idx * 37) % 65);
    let yPercent = 25 + ((idx * 29) % 55);

    const locName = m.location || 'Memory Location';
    if (locName.toLowerCase().includes('york') || locName.toLowerCase().includes('usa')) {
      xPercent = 28; yPercent = 38;
    } else if (locName.toLowerCase().includes('paris') || locName.toLowerCase().includes('europe') || locName.toLowerCase().includes('london')) {
      xPercent = 50; yPercent = 32;
    } else if (locName.toLowerCase().includes('tokyo') || locName.toLowerCase().includes('japan') || locName.toLowerCase().includes('asia')) {
      xPercent = 82; yPercent = 42;
    } else if (locName.toLowerCase().includes('home')) {
      xPercent = 40; yPercent = 52;
    }

    return {
      ...m,
      xPercent,
      yPercent,
      locationName: locName
    };
  });

  return (
    <div className="glass-panel rounded-3xl p-5 border shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-teal-500/20 border border-teal-500/30 text-teal-300 flex items-center justify-center font-black text-lg">
            🗺️
          </div>
          <div>
            <h3 className="font-extrabold text-base text-blue-950 flex items-center gap-2">
              <span>Geotagged Memory Map</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-teal-400 text-teal-950 font-black">
                {geotaggedMoments.length} Pins
              </span>
            </h3>
            <p className="text-xs text-slate-500">Explore memories logged across different places and regions</p>
          </div>
        </div>

        {/* Location Region Filters */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          {POPULAR_LOCATIONS.map((loc) => (
            <button
              key={loc.name}
              onClick={() => setSelectedLocationFilter(loc.name)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                selectedLocationFilter === loc.name
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'glass-card text-slate-600 hover:text-slate-900'
              }`}
            >
              {loc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Map Visual Stage */}
      <div className="relative h-80 sm:h-96 rounded-2xl overflow-hidden border border-white/20 bg-slate-900 flex items-center justify-center group">
        {/* World Map SVG Canvas background pattern */}
        <div 
          className="absolute inset-0 opacity-25 bg-cover bg-center pointer-events-none transition-transform duration-1000 group-hover:scale-105"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 50%, rgba(20, 184, 166, 0.3) 0%, transparent 70%), url("https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80")`
          }}
        />
        
        {/* Geographic Grid Lines */}
        <div 
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.2) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/80 backdrop-blur-md text-teal-300 text-xs font-bold border border-teal-500/30">
          <Compass className="w-3.5 h-3.5 animate-spin" />
          <span>Interactive World Coordinates</span>
        </div>

        {/* Map Memory Pins */}
        {geotaggedMoments.map((mom) => (
          <div
            key={mom.id}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group/pin"
            style={{ left: `${mom.xPercent}%`, top: `${mom.yPercent}%` }}
            onClick={() => setActivePinMoment(mom)}
          >
            {/* Animated Pulsing Halo */}
            <div className="absolute inset-0 -m-2 rounded-full bg-teal-400/30 animate-ping pointer-events-none" />

            {/* Pin Head */}
            <div className="relative flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border border-teal-400 text-white shadow-lg text-xs font-extrabold hover:scale-110 transition">
              <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
              <span className="truncate max-w-[90px]">{mom.title}</span>
            </div>

            {/* Hover Tooltip Preview */}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 glass-panel p-2.5 rounded-xl text-slate-800 text-xs shadow-2xl opacity-0 group-hover/pin:opacity-100 transition pointer-events-none z-30 space-y-1 border">
              <p className="font-extrabold text-blue-950 truncate">{mom.title}</p>
              <p className="text-[10px] text-teal-700 font-bold flex items-center gap-1">
                <Navigation className="w-3 h-3" />
                {mom.locationName}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Selected Moment Pin Details Popup Modal */}
      {activePinMoment && (
        <div className="glass-card p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in bg-teal-500/10 border-teal-500/30">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-950 flex items-center justify-center font-black">
              📍
            </div>
            <div>
              <span className="text-[11px] font-bold text-teal-700 uppercase tracking-wider">
                {activePinMoment.locationName}
              </span>
              <h4 className="font-black text-sm text-blue-950">{activePinMoment.title}</h4>
              <p className="text-xs text-slate-600 line-clamp-1">{activePinMoment.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {onSelectMoment && (
              <button
                onClick={() => {
                  onSelectMoment(activePinMoment);
                  setActivePinMoment(null);
                }}
                className="px-4 py-2 rounded-xl bg-blue-900 text-white font-extrabold text-xs hover:bg-blue-950 transition"
              >
                Open Memory
              </button>
            )}
            <button
              onClick={() => setActivePinMoment(null)}
              className="p-2 rounded-xl glass-card text-slate-500 hover:text-slate-900 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
