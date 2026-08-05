import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useFetch } from '../hooks/useFetch.js';
import { copyToClipboard } from '../utils/api.js';
import { PlusCircle, Hash, Users, Sparkles, Search, ChevronRight, Copy, Check } from 'lucide-react';

export const SpacesPage = ({ onOpenCreateSpaceModal, onOpenJoinSpaceModal }) => {
  const { user, token } = useAuth();
  const [page, setPage] = useState(1);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const { data: spacesRes, loading, refetch } = useFetch(
    user ? `/api/spaces?user_id=${user.id}&page=${page}&per_page=12` : ''
  );

  const handleCopyCode = async (e, space) => {
    e.preventDefault();
    e.stopPropagation();
    if (space?.invite_code) {
      const ok = await copyToClipboard(space.invite_code);
      if (ok) {
        setCopiedCodeId(space.id);
        setTimeout(() => setCopiedCodeId(null), 2000);
      }
    }
  };

  const spaces = spacesRes?.data || [];
  const pagination = spacesRes?.pagination;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 text-slate-800">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-900" />
            <h1 className="text-xl md:text-2xl font-black text-blue-950">Memory Spaces</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Group scrapbooks and shared loops for your circles, classes, and squads.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenJoinSpaceModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition"
          >
            <Hash className="w-4 h-4 text-emerald-600" />
            <span>Join via Code</span>
          </button>

          <button
            onClick={onOpenCreateSpaceModal}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Space</span>
          </button>
        </div>
      </div>

      {/* Grid of Spaces */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-3xl">
          Loading memory spaces...
        </div>
      ) : spaces.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-3xl space-y-3">
          <p className="font-bold text-slate-700 text-sm">No memory spaces found.</p>
          <p>Create a space or join one using an invite code to start sharing moments!</p>
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenCreateSpaceModal}
              className="px-4 py-2 bg-blue-900 text-white font-bold rounded-xl text-xs"
            >
              Create First Space
            </button>
            <button
              onClick={onOpenJoinSpaceModal}
              className="px-4 py-2 bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs"
            >
              Enter Code
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spaces.map((s) => (
            <div
              key={s.id}
              className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-3xl p-2 bg-slate-50 border border-slate-100 rounded-2xl">{s.icon}</span>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      s.is_member
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {s.is_member ? `Member (${s.user_role || 'member'})` : 'Public Space'}
                  </span>
                </div>

                <div>
                  <h2 className="text-base font-extrabold text-blue-950">{s.name}</h2>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed line-clamp-2">
                    {s.description || 'A group scrapbook for memories.'}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="space-y-1">
                  <button
                    onClick={(e) => handleCopyCode(e, s)}
                    className="flex items-center gap-1 font-mono text-[11px] text-blue-900 font-extrabold bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 transition"
                    title="Click to copy invite code"
                  >
                    <span>Code: {s.invite_code}</span>
                    {copiedCodeId === s.id ? (
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400 shrink-0" />
                    )}
                  </button>
                  <span className="text-[11px] text-slate-400 block">
                    {s.member_count} members • {s.moments_count} moments
                  </span>
                </div>

                <Link
                  to={`/spaces/${s.id}`}
                  className="px-3.5 py-1.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1 transition shadow-xs"
                >
                  <span>Open</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.total_pages > 1 && (
        <div className="flex items-center justify-between pt-4 text-xs">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50"
          >
            Previous
          </button>
          <span className="text-slate-500">
            Page {page} of {pagination.total_pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
            disabled={page === pagination.total_pages}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
