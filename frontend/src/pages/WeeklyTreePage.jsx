import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useFetch } from '../hooks/useFetch.js';
import { WeeklyTreeCanvas } from '../components/WeeklyTreeCanvas.jsx';
import { TreePine, Sparkles, Users, BookOpen } from 'lucide-react';

export const WeeklyTreePage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: spacesRes } = useFetch(user ? `/api/spaces?user_id=${user.id}&per_page=50` : '');
  const spaces = spacesRes?.data || [];

  const [selectedSpaceId, setSelectedSpaceId] = useState('');

  const currentSpaceId = selectedSpaceId || spaces[0]?.id;

  const { data: treeRes, loading } = useFetch(currentSpaceId ? `/api/spaces/${currentSpaceId}/weekly-tree` : '');
  const { data: momentsRes } = useFetch(currentSpaceId ? `/api/moments?space_id=${currentSpaceId}` : '');
  const moments = momentsRes?.data || [];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 text-slate-800">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TreePine className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl md:text-2xl font-black text-blue-950">Weekly Memory Tree</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Visual tree canvas with daily picture bubbles generated from shared moments & photos.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Link
            to="/scrapbook"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 font-bold text-xs shadow-2xs transition"
          >
            <BookOpen className="w-4 h-4 text-pink-600" />
            <span>📖 Weekly Scrapbook Collage</span>
          </Link>

          {spaces.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600">Space:</label>
              <select
                value={currentSpaceId || ''}
                onChange={(e) => setSelectedSpaceId(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-blue-950 focus:outline-none focus:border-blue-900"
              >
                {spaces.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.icon} {s.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-3xl">
          Rendering Memory Tree Canvas...
        </div>
      ) : treeRes ? (
        <WeeklyTreeCanvas treeData={treeRes} moments={moments} />
      ) : (
        <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-3xl">
          Join or create a space to view its memory tree canvas.
        </div>
      )}
    </div>
  );
};
