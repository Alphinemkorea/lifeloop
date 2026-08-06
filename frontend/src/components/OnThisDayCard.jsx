import React, { useState } from 'react';
import { Calendar, Sparkles, Heart, Clock, Gift, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';

export const OnThisDayCard = ({ moments = [], onSelectMoment }) => {
  const [selectedIdx, setSelectedIdx] = useState(0);

  // Filter moments created on same month & day OR past nostalgic moments
  const today = new Date();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  const sameDayMoments = moments.filter(m => {
    if (!m.date && !m.created_at) return false;
    const d = new Date(m.date || m.created_at);
    return d.getMonth() === todayMonth && d.getDate() === todayDate;
  });

  // Fallback to top historical nostalgic moments if no exact same-day match exists
  const flashbackMoments = sameDayMoments.length > 0 ? sameDayMoments : moments.slice(0, 3);

  if (flashbackMoments.length === 0) return null;

  const activeFlashback = flashbackMoments[selectedIdx % flashbackMoments.length];

  const triggerCelebration = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  return (
    <div className="glass-panel rounded-3xl p-5 border shadow-sm relative overflow-hidden space-y-4">
      {/* Decorative ambient gradient */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-amber-400/10 rounded-full blur-2xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-950 flex items-center justify-center font-black">
            ⏳
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-blue-950 flex items-center gap-1.5">
              <span>On This Day & Nostalgia</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black tracking-wide uppercase">
                Flashback
              </span>
            </h3>
            <p className="text-xs text-slate-500">Relive special loops logged in your history</p>
          </div>
        </div>

        <button
          onClick={triggerCelebration}
          className="p-2 rounded-xl bg-amber-400/20 text-amber-950 hover:bg-amber-400/30 transition text-xs font-bold flex items-center gap-1"
          title="Celebrate Nostalgia!"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-spin" />
          <span>Celebrate</span>
        </button>
      </div>

      {/* Active Flashback Card */}
      {activeFlashback && (
        <div className="glass-card rounded-2xl p-4 border space-y-3 relative group transition hover:border-amber-400/50">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold text-amber-950/80 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                Logged on {activeFlashback.date || new Date(activeFlashback.created_at).toLocaleDateString()}
              </span>
              <h4 className="font-black text-base text-slate-900 mt-1">{activeFlashback.title}</h4>
            </div>

            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900/10 text-slate-800">
              {activeFlashback.mood}
            </span>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {activeFlashback.description || "A priceless memory saved in your LifeLoop scrapbook."}
          </p>

          {/* Photo attachment preview if present */}
          {activeFlashback.photos && activeFlashback.photos.length > 0 && (
            <div className="h-32 rounded-xl overflow-hidden border border-white/20">
              <img
                src={activeFlashback.photos[0].url}
                alt={activeFlashback.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-200/50 text-xs font-bold">
            <span className="text-slate-500 text-[11px]">
              By {activeFlashback.user_name || "Space Member"}
            </span>

            {onSelectMoment && (
              <button
                onClick={() => onSelectMoment(activeFlashback)}
                className="text-blue-900 hover:text-amber-600 font-extrabold flex items-center gap-1 transition"
              >
                <span>View Full Memory</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Flashback Navigation indicators if multiple */}
      {flashbackMoments.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {flashbackMoments.map((_, i) => (
            <button
              key={i}
              onClick={() => setSelectedIdx(i)}
              className={`h-2 rounded-full transition-all ${
                i === selectedIdx ? 'w-6 bg-amber-500' : 'w-2 bg-slate-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};
