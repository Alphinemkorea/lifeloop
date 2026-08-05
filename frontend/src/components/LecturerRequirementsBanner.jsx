import React, { useState } from 'react';
import { CheckCircle2, ChevronDown, ChevronUp, Database, ShieldCheck, Users, Layers, Sparkles } from 'lucide-react';

export const LecturerRequirementsBanner = () => {
  const [expanded, setExpanded] = useState(false);

  const requirements = [
    { title: '1:1 Relationship', detail: 'User ↔ Profile (Age, Bio, Instagram Handle, Local Avatar File Upload)' },
    { title: '1:Many Relationship', detail: 'Space ↔ Moments (Photos, Music, Moods, Comments, Reactions)' },
    { title: 'Many:Many Relationship', detail: 'User ↔ Space via Memberships (Role: Owner / Member, Nicknames)' },
    { title: 'Full Stack Integration', detail: 'REST API Express Server + Vite React Client + Base64 File Storage' },
    { title: 'Pagination & Filters', detail: 'Paginated Spaces & Moments with Category and Search Queries' }
  ];

  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-3xl p-4 md:p-6 shadow-md space-y-3">
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center font-bold text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-black flex items-center gap-2">
              <span>LifeLoop Architecture & Requirements Standard</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                Verified
              </span>
            </h2>
            <p className="text-[11px] text-blue-200/80">Full-stack database mapping & API compliance</p>
          </div>
        </div>

        <button className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {expanded && (
        <div className="pt-3 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs animate-fade-in">
          {requirements.map((req, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-3 space-y-1">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{req.title}</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-normal">{req.detail}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
