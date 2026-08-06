import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useFetch } from '../hooks/useFetch.js';
import { SpaceCard } from '../components/SpaceCard.jsx';
import { EditSpaceModal } from '../components/EditSpaceModal.jsx';
import { PlusCircle, Hash, Users, Compass, ChevronRight } from 'lucide-react';

export const SpacesPage = ({ onOpenCreateSpaceModal, onOpenJoinSpaceModal }) => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [viewTab, setViewTab] = useState('my'); // 'my' | 'all'
  const [editingSpace, setEditingSpace] = useState(null);

  const fetchUrl = user
    ? `/api/spaces?user_id=${user.id}&page=${page}&per_page=12${viewTab === 'my' ? '&joined_only=true' : ''}`
    : '';

  const { data: spacesRes, loading, refetch } = useFetch(fetchUrl);

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
            Group scrapbooks, memory trees, and shared loops for your circles, classes, and squads.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
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

      {/* View Filter Tabs */}
      <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-2xl w-fit text-xs font-bold border border-slate-200">
        <button
          onClick={() => { setViewTab('my'); setPage(1); }}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            viewTab === 'my'
              ? 'bg-white text-blue-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-900" />
          <span>My Spaces</span>
        </button>
        <button
          onClick={() => { setViewTab('all'); setPage(1); }}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
            viewTab === 'all'
              ? 'bg-white text-blue-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-emerald-600" />
          <span>Discover All Spaces</span>
        </button>
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
            <SpaceCard
              key={s.id}
              space={s}
              onOpenEditModal={(spaceToEdit) => setEditingSpace(spaceToEdit)}
            />
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
          <span className="text-slate-500 font-medium">
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

      <EditSpaceModal
        isOpen={!!editingSpace}
        onClose={() => setEditingSpace(null)}
        space={editingSpace}
        onSpaceUpdated={() => {
          refetch();
          setEditingSpace(null);
        }}
      />
    </div>
  );
};
