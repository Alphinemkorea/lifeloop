import React, { useRef } from 'react';
import { BookOpen, Printer, Download, Sparkles, X, Heart, Calendar, User } from 'lucide-react';

export const KeepsakePhotobook = ({ isOpen, onClose, space = {}, moments = [] }) => {
  const printContainerRef = useRef(null);

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      {/* Printable CSS style block specifically targeting photobook print rendering */}
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-photobook-content, #printable-photobook-content * {
            visibility: visible;
          }
          #printable-photobook-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-after: always;
          }
        }
      `}</style>

      <div className="w-full max-w-4xl glass-panel rounded-3xl border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 md:p-6 border-b border-white/10 flex items-center justify-between no-print bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400/20 text-amber-950 flex items-center justify-center font-black text-lg border border-amber-400/30">
              📖
            </div>
            <div>
              <h3 className="font-black text-lg text-blue-950 flex items-center gap-2">
                <span>Keepsake Photobook & PDF Export</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 font-black">
                  Print Ready
                </span>
              </h3>
              <p className="text-xs text-slate-500">Formated album spread ready for printing or PDF download</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-amber-400 text-amber-950 font-extrabold text-xs flex items-center gap-2 hover:bg-amber-300 transition shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Download PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl glass-card text-slate-500 hover:text-slate-900 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Photobook Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-12 bg-amber-50/30 text-slate-900 font-serif" id="printable-photobook-content" ref={printContainerRef}>
          
          {/* COVER PAGE */}
          <div className="min-h-[500px] border-4 border-amber-900/20 rounded-3xl p-8 md:p-12 flex flex-col justify-between text-center bg-white shadow-md relative page-break">
            <div className="space-y-4 my-auto">
              <span className="text-4xl">🌿</span>
              <h1 className="text-4xl md:text-5xl font-black text-blue-950 tracking-tight font-serif">
                {space.name || "LifeLoop Memory Space"}
              </h1>
              <p className="text-base text-slate-600 max-w-lg mx-auto italic font-sans">
                {space.description || "A curated keepsake of shared memories, photos, and weekly loops."}
              </p>
            </div>

            <div className="pt-8 border-t border-amber-900/10 font-sans text-xs text-slate-500 flex items-center justify-between">
              <span>LifeLoop Keepsake Edition</span>
              <span>{new Date().getFullYear()} Album</span>
            </div>
          </div>

          {/* DEDICATION PAGE */}
          <div className="min-h-[400px] border border-slate-200 rounded-3xl p-8 bg-white shadow-sm space-y-6 page-break font-sans">
            <div className="border-b pb-4">
              <h2 className="text-xl font-bold text-blue-950 font-serif">Album Dedication & Members</h2>
              <p className="text-xs text-slate-500">Shared with love between memory space contributors</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {space.members?.map((mem) => (
                <div key={mem.id} className="p-3 bg-amber-50/50 rounded-2xl border flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden shrink-0">
                    <img src={mem.avatar_url || 'https://api.dicebear.com/7.x/bottts/svg?seed=user'} alt={mem.user_name} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900">{mem.user_name}</h4>
                    <span className="text-[10px] text-amber-800 font-bold capitalize">{mem.role}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* MEMORY SPREADS */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-blue-950 font-serif border-b pb-3">
              Memory Spreads ({moments.length} Logged Loops)
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {moments.map((mom, idx) => (
                <div key={mom.id} className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm space-y-4 flex flex-col justify-between font-sans">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                        {mom.date || "Memory Date"}
                      </span>
                      <span className="text-xs font-bold text-slate-500">#{idx + 1}</span>
                    </div>

                    <h3 className="font-extrabold text-lg text-slate-900 font-serif">{mom.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{mom.description}</p>
                  </div>

                  {mom.photos && mom.photos.length > 0 && (
                    <div className="h-44 rounded-xl overflow-hidden border">
                      <img src={mom.photos[0].url} alt={mom.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="pt-3 border-t text-[11px] text-slate-400 flex items-center justify-between">
                    <span>By {mom.user_name || "Space Member"}</span>
                    <span>Mood: {mom.mood}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
