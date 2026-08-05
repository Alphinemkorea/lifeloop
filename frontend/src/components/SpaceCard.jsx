import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { copyToClipboard } from '../utils/api.js';
import { Copy, Check, Users, Sparkles, Edit3, ChevronRight, Crown } from 'lucide-react';

export const SpaceCard = ({ space, onOpenEditModal }) => {
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (space?.invite_code) {
      const ok = await copyToClipboard(space.invite_code);
      if (ok) {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
    }
  };

  const handleEditClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onOpenEditModal) {
      onOpenEditModal(space);
    }
  };

  const isOwner = space.is_owner || space.user_role === 'owner';

  return (
    <div className="bg-white border border-slate-200 hover:border-blue-900 rounded-3xl overflow-hidden shadow-2xs hover:shadow-md transition group flex flex-col justify-between">
      {/* Top Banner Cover Photo */}
      <div className="h-28 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 relative overflow-hidden">
        {space.cover_url && (
          <img
            src={space.cover_url}
            alt={space.name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300 opacity-80"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10">
          <span
            className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 shadow-xs border ${
              isOwner
                ? 'bg-amber-400 text-amber-950 border-amber-300'
                : space.is_member
                ? 'bg-emerald-500 text-white border-emerald-400'
                : 'bg-slate-800/80 text-white border-slate-600 backdrop-blur-xs'
            }`}
          >
            {isOwner ? (
              <>
                <Crown className="w-3 h-3 fill-amber-950 text-amber-950" />
                <span>Space Owner</span>
              </>
            ) : space.is_member ? (
              <span>Member</span>
            ) : (
              <span>Public Space</span>
            )}
          </span>

          {space.is_member && onOpenEditModal && (
            <button
              onClick={handleEditClick}
              className="px-2.5 py-1 rounded-full bg-white/90 hover:bg-white text-blue-950 font-bold text-[10px] shadow-sm flex items-center gap-1 transition backdrop-blur-xs"
              title="Edit space appearance (Name, Photo, Icon)"
            >
              <Edit3 className="w-3 h-3 text-blue-900" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {/* Space Icon & Name Overlay */}
        <div className="absolute bottom-2 left-3 right-3 flex items-end gap-2.5 z-10">
          <div className="w-10 h-10 rounded-2xl bg-white border-2 border-white shadow-md flex items-center justify-center text-xl shrink-0">
            {space.icon || '🌿'}
          </div>
          <div className="text-white min-w-0 pb-0.5">
            <h3 className="font-black text-sm md:text-base leading-tight truncate text-white drop-shadow-sm">
              {space.name}
            </h3>
          </div>
        </div>
      </div>

      {/* Body Content */}
      <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {space.description || 'Private group scrapbook for sharing moments and memory trees.'}
        </p>

        {/* Footer Info & Action */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs gap-2">
          <div className="space-y-1">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1 font-mono text-[11px] font-extrabold text-blue-950 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 transition"
              title="Click to copy invite code"
            >
              <span>Code: {space.invite_code}</span>
              {copiedCode ? (
                <Check className="w-3 h-3 text-emerald-600 shrink-0" />
              ) : (
                <Copy className="w-3 h-3 text-slate-400 shrink-0" />
              )}
            </button>
            <span className="text-[10px] text-slate-400 block font-medium">
              {space.member_count || 1} members • {space.moments_count || 0} moments
            </span>
          </div>

          <Link
            to={`/spaces/${space.id}`}
            className="px-3.5 py-1.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-white font-bold text-xs flex items-center gap-1 transition shadow-2xs shrink-0"
          >
            <span>Open</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
