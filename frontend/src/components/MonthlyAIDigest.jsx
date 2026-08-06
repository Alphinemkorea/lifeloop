import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, PieChart, Heart, Calendar, RefreshCw, Award } from 'lucide-react';

export const MonthlyAIDigest = ({ spaceId, token }) => {
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('August 2026');

  const fetchDigest = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/digest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ space_id: spaceId, month: selectedMonth })
      });
      const data = await res.json();
      setDigest(data);
    } catch (err) {
      console.error("Failed to fetch AI digest:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDigest();
  }, [spaceId, selectedMonth]);

  return (
    <div className="glass-panel rounded-3xl p-5 md:p-6 border shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-black text-lg">
            📊
          </div>
          <div>
            <h3 className="font-extrabold text-base text-blue-950 flex items-center gap-2">
              <span>Monthly AI Digest & Mood Analytics</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-400 text-purple-950 font-black">
                Gemini 3.6
              </span>
            </h3>
            <p className="text-xs text-slate-500">Intelligent emotional themes & monthly story recap</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="glass-input rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800"
          >
            <option value="August 2026">August 2026</option>
            <option value="July 2026">July 2026</option>
            <option value="June 2026">June 2026</option>
          </select>

          <button
            onClick={fetchDigest}
            disabled={loading}
            className="p-2 rounded-xl glass-card text-purple-600 hover:bg-purple-50 transition"
            title="Refresh Digest"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-10 text-center space-y-2">
          <Sparkles className="w-8 h-8 text-purple-500 animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-600">Synthesizing Monthly AI Digest & Emotional Analytics...</p>
        </div>
      ) : digest ? (
        <div className="space-y-5 animate-fade-in">
          {/* Top Mood Banner */}
          <div className="glass-card p-4 rounded-2xl border flex items-center justify-between gap-4 bg-purple-500/10 border-purple-500/20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center font-black text-xl shadow-md">
                ✨
              </div>
              <div>
                <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Dominant Atmosphere</span>
                <h4 className="font-black text-lg text-blue-950">{digest.top_mood || "Joyful & Connected"}</h4>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-black text-purple-900">{digest.total_moments || 0}</span>
              <p className="text-[11px] text-slate-500 font-bold">Moments Logged</p>
            </div>
          </div>

          {/* Story Recap Narrative */}
          <div className="glass-card p-5 rounded-2xl border space-y-2">
            <h4 className="font-extrabold text-xs text-purple-950 flex items-center gap-1.5 uppercase tracking-wide">
              <Brain className="w-4 h-4 text-purple-600" />
              <span>{digest.month_label} AI Highlight Story</span>
            </h4>
            <p className="text-xs text-slate-700 leading-relaxed italic">
              "{digest.story_recap}"
            </p>
          </div>

          {/* Emotional Themes Chips */}
          {digest.emotional_themes && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-500">Key Emotional Themes:</span>
              <div className="flex flex-wrap gap-2">
                {digest.emotional_themes.map((theme, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-100 text-purple-900 border border-purple-200 shadow-2xs"
                  >
                    💖 {theme}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* AI Recommendation Note */}
          {digest.ai_recommendation && (
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 text-xs font-bold flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-600 shrink-0" />
              <span>AI Tip: {digest.ai_recommendation}</span>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
