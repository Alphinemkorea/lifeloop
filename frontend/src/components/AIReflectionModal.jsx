import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { Sparkles, X, RefreshCw, Quote, Heart, Lightbulb, Bookmark, Share2 } from 'lucide-react';

export const AIReflectionModal = ({ isOpen, onClose, spaceId, spaceName }) => {
  const { token } = useAuth();
  const [reflection, setReflection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const fetchReflection = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/ai/reflect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ space_id: spaceId || null })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate reflection');
      }
      setReflection(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !reflection) {
      fetchReflection();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleShare = () => {
    if (!reflection) return;
    const shareText = `🌿 LifeLoop Memory Reflection: "${reflection.title}"\n\n"${reflection.reflection_quote}"\n\n${reflection.summary}`;
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 w-full max-w-xl shadow-2xl space-y-6 text-slate-800 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black text-slate-900">AI Memory Reflection</h2>
                {spaceName && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 rounded-full border border-blue-200">
                    {spaceName}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">Personalized recap powered by Gemini 3.6 Flash</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-12 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold text-slate-600">Weaving your shared moments into a reflection...</p>
            <p className="text-xs text-slate-400">Analyzing mood vibes, song notes, and photos</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-xs space-y-2">
            <p className="font-bold">Could not generate reflection</p>
            <p>{error}</p>
            <button
              onClick={fetchReflection}
              className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-rose-800 underline hover:text-rose-950"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Try Again
            </button>
          </div>
        )}

        {/* Content */}
        {reflection && !loading && (
          <div className="space-y-6">
            {/* Title & Vibe Badge */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 bg-white/80 backdrop-blur-xs border border-blue-200 text-blue-800 font-bold text-xs rounded-full shadow-2xs inline-flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                  {reflection.mood_vibe || 'Reflective'}
                </span>
              </div>
              <h3 className="text-xl font-black text-slate-900 leading-snug">{reflection.title}</h3>
              <p className="text-xs md:text-sm text-slate-600 leading-relaxed font-normal">{reflection.summary}</p>
            </div>

            {/* Quote block */}
            {reflection.reflection_quote && (
              <div className="relative p-4 bg-slate-900 text-slate-100 rounded-2xl border border-slate-800 space-y-2">
                <Quote className="w-6 h-6 text-blue-400 opacity-40 absolute top-3 right-4" />
                <p className="text-xs md:text-sm font-medium italic pr-6 text-blue-100">
                  "{reflection.reflection_quote}"
                </p>
              </div>
            )}

            {/* Highlights */}
            {reflection.highlights && reflection.highlights.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-blue-600" />
                  Memory Highlights
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {reflection.highlights.map((item, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-700 font-medium flex items-start gap-2">
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[10px]">
                        {idx + 1}
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Encouragement note */}
            {reflection.encouragement && (
              <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center gap-2.5">
                <Lightbulb className="w-4 h-4 text-emerald-600 shrink-0" />
                <p className="font-medium">{reflection.encouragement}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                onClick={fetchReflection}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Regenerate Reflection
              </button>

              <button
                onClick={handleShare}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md transition"
              >
                <Share2 className="w-3.5 h-3.5" />
                {copied ? 'Copied Reflection!' : 'Copy & Share'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIReflectionModal;
