import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';
import { MomentCard } from '../components/MomentCard.jsx';
import { MOODS, CATEGORIES } from '../types.js';
import { Sparkles, Search, Filter } from 'lucide-react';

export const MomentsPage = () => {
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState('');
  const [mood, setMood] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (initialQuery) setQuery(initialQuery);
  }, [initialQuery]);

  const momentsUrl = `/api/moments?page=${page}&per_page=12${
    query ? `&query=${encodeURIComponent(query)}` : ''
  }${category ? `&category=${encodeURIComponent(category)}` : ''}${
    mood ? `&mood=${encodeURIComponent(mood)}` : ''
  }`;

  const { data: momentsRes, loading, refetch } = useFetch(momentsUrl);

  const moments = momentsRes?.data || [];
  const pagination = momentsRes?.pagination;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 text-slate-800">
      {/* Search & Filter Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h1 className="text-xl font-black text-blue-950">Moments & Memories Gallery</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Query input */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, description, keywords..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-slate-900 focus:outline-none focus:border-blue-900"
            />
          </div>

          {/* Category */}
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900"
          >
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Mood */}
          <select
            value={mood}
            onChange={(e) => {
              setMood(e.target.value);
              setPage(1);
            }}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900"
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

      {/* Grid of Moments */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-3xl">
          Loading moments...
        </div>
      ) : moments.length === 0 ? (
        <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-3xl">
          No moments matching search criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {moments.map((m) => (
            <MomentCard key={m.id} moment={m} onDelete={() => refetch()} onUpdated={() => refetch()} />
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
