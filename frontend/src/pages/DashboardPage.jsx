import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useFetch } from '../hooks/useFetch.js';
import { copyToClipboard } from '../utils/api.js';
import { MomentCard } from '../components/MomentCard.jsx';
import { SpaceCard } from '../components/SpaceCard.jsx';
import { EditSpaceModal } from '../components/EditSpaceModal.jsx';
import { AIReflectionModal } from '../components/AIReflectionModal.jsx';
import { MOODS, CATEGORIES } from '../types.js';
import { PlusCircle, Users, Sparkles, Filter, Search, ChevronRight, Hash, TreePine, Copy, Check } from 'lucide-react';

export const DashboardPage = ({ onOpenNewMomentModal, onOpenJoinSpaceModal, onOpenCreateSpaceModal }) => {
  const { user, profile } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedMood, setSelectedMood] = useState('');
  const [page, setPage] = useState(1);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const [isAIReflectionOpen, setIsAIReflectionOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState(null);

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

  // Fetch User's Spaces
  const { data: spacesRes, refetch: refetchSpaces } = useFetch(user ? `/api/spaces?user_id=${user.id}&joined_only=true&per_page=10` : '');

  // Fetch Moments Feed
  const momentsUrl = `/api/moments?page=${page}&per_page=10${
    user ? `&current_user_id=${user.id}` : ''
  }${
    selectedCategory ? `&category=${encodeURIComponent(selectedCategory)}` : ''
  }${selectedMood ? `&mood=${encodeURIComponent(selectedMood)}` : ''}`;

  const { data: momentsRes, loading: loadingMoments, refetch: refetchMoments } = useFetch(momentsUrl);

  const spaces = spacesRes?.data || [];
  const moments = momentsRes?.data || [];
  const pagination = momentsRes?.pagination;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 text-slate-800">
      {/* Welcome Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.full_name}`}
            alt={user?.full_name}
            className="w-16 h-16 rounded-2xl object-cover bg-slate-100 border-2 border-blue-900 shadow-sm"
          />
          <div>
            <h1 className="text-xl md:text-2xl font-black text-blue-950">
              Good day, {user?.full_name?.split(' ')[0]}! 🌿
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 max-w-md">
              {profile?.favorite_quote ? `"${profile.favorite_quote}"` : 'Your private memory scrapbooks and shared squad loops'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            onClick={onOpenNewMomentModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Moment</span>
          </button>

          <button
            onClick={() => setIsAIReflectionOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm transition"
          >
            <Sparkles className="w-4 h-4 text-blue-200 animate-pulse" />
            <span>AI Reflection ✦</span>
          </button>

          <Link
            to="/weekly-tree"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold border border-emerald-200 transition"
          >
            <TreePine className="w-4 h-4 text-emerald-600" />
            <span>Memory Tree</span>
          </Link>
        </div>
      </div>

      {/* Spaces Horizontal Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-900" />
            <h2 className="text-sm font-extrabold text-blue-950">My Memory Spaces ({spaces.length})</h2>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={onOpenCreateSpaceModal}
              className="text-blue-900 font-bold hover:underline flex items-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create Space</span>
            </button>
            <span>•</span>
            <button
              onClick={onOpenJoinSpaceModal}
              className="text-blue-900 font-bold hover:underline flex items-center gap-1"
            >
              <Hash className="w-3.5 h-3.5 text-emerald-600" />
              <span>Join via Code</span>
            </button>
            <span>•</span>
            <Link to="/spaces" className="text-slate-500 hover:text-blue-900 font-semibold flex items-center gap-0.5">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {spaces.slice(0, 4).map((space) => (
            <SpaceCard
              key={space.id}
              space={space}
              onOpenEditModal={(s) => setEditingSpace(s)}
            />
          ))}
        </div>
      </div>

      {/* Moments Feed Section with Filters */}
      <div className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span className="font-extrabold text-sm text-blue-950">Memory Feed</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-900"
            >
              <option value="">All Categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Mood Filter */}
            <select
              value={selectedMood}
              onChange={(e) => {
                setSelectedMood(e.target.value);
                setPage(1);
              }}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-900"
            >
              <option value="">All Moods</option>
              {MOODS.map((m) => (
                <option key={m.label} value={m.label}>
                  {m.emoji} {m.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Moments Cards Grid */}
        {loadingMoments ? (
          <div className="p-12 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-3xl">
            Loading moments feed...
          </div>
        ) : moments.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-3xl space-y-2">
            <p className="font-bold text-slate-700">No moments found in this filter.</p>
            <p>Click "Post New Moment" to share your first memory!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {moments.map((m) => (
              <MomentCard key={m.id} moment={m} onDelete={() => refetchMoments()} onUpdated={() => refetchMoments()} />
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between pt-4 text-xs">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50"
            >
              Previous Page
            </button>

            <span className="text-slate-500 font-medium">
              Page {page} of {pagination.total_pages} ({pagination.total} moments total)
            </span>

            <button
              onClick={() => setPage((p) => Math.min(pagination.total_pages, p + 1))}
              disabled={page === pagination.total_pages}
              className="px-4 py-2 rounded-xl bg-white border border-slate-200 font-bold text-slate-700 disabled:opacity-40 hover:bg-slate-50"
            >
              Next Page
            </button>
          </div>
        )}
      </div>

      <AIReflectionModal
        isOpen={isAIReflectionOpen}
        onClose={() => setIsAIReflectionOpen(false)}
      />

      <EditSpaceModal
        isOpen={!!editingSpace}
        onClose={() => setEditingSpace(null)}
        space={editingSpace}
        onSpaceUpdated={() => {
          refetchSpaces();
          setEditingSpace(null);
        }}
      />
    </div>
  );
};
