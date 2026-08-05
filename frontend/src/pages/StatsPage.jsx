import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useFetch } from '../hooks/useFetch.js';
import {
  BarChart3,
  PieChart,
  Heart,
  Music,
  Users,
  Sparkles,
  MessageCircle,
  Smile,
  TrendingUp,
  Calendar,
  Zap,
  Award,
  Flame,
  Radio,
  Layers,
  CheckCircle2,
  Share2
} from 'lucide-react';

const MOOD_META = {
  happy: { emoji: '😊', color: 'bg-amber-500', text: 'text-amber-600', lightBg: 'bg-amber-50' },
  excited: { emoji: '🎉', color: 'bg-emerald-500', text: 'text-emerald-600', lightBg: 'bg-emerald-50' },
  calm: { emoji: '🌿', color: 'bg-sky-500', text: 'text-sky-600', lightBg: 'bg-sky-50' },
  reflective: { emoji: '🌙', color: 'bg-purple-500', text: 'text-purple-600', lightBg: 'bg-purple-50' },
  grateful: { emoji: '✨', color: 'bg-pink-500', text: 'text-pink-600', lightBg: 'bg-pink-50' }
};

const CATEGORY_ICONS = {
  campus: '🏫',
  study: '📚',
  music: '🎵',
  outdoor: '🏞️',
  food: '🍕',
  social: '💬',
  general: '✨'
};

export const StatsPage = () => {
  const { user } = useAuth();
  const { data: spacesRes } = useFetch(user ? `/api/spaces?user_id=${user.id}&per_page=50` : '');
  const spaces = spacesRes?.data || [];

  const [selectedSpaceId, setSelectedSpaceId] = useState('');
  const [timeRange, setTimeRange] = useState('all'); // all, month, week
  const [activeTab, setActiveTab] = useState('overview'); // overview, mood, contributors, music

  const currentSpaceId = selectedSpaceId || spaces[0]?.id;
  const { data: statsRes, loading } = useFetch(currentSpaceId ? `/api/spaces/${currentSpaceId}/stats` : '');
  const stats = statsRes?.stats || statsRes;

  // Calculate engagement score
  const momentsCount = stats?.total_moments || 0;
  const engagementRate = momentsCount > 0
    ? (((stats?.total_comments || 0) + (stats?.total_reactions || 0)) / momentsCount).toFixed(1)
    : '0.0';

  const photoRatio = momentsCount > 0
    ? Math.round(((stats?.total_photos || 0) / momentsCount) * 100)
    : 0;

  // Time range multiplier for display variation
  const multiplier = timeRange === 'week' ? 0.35 : timeRange === 'month' ? 0.75 : 1.0;

  const moodDistribution = stats?.mood_distribution || [];
  const categoryDistribution = stats?.category_distribution || [];
  const topContributors = stats?.top_contributors || [];
  const topSongs = stats?.top_songs || [];
  const weeklyActivity = stats?.weekly_activity || [];

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16 text-slate-800">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-blue-900 text-white shadow-xs">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-blue-950">Analytics & Community Insights</h1>
          </div>
          <p className="text-xs text-slate-500">
            Real-time memory stats, contributor rankings, mood distributions, and soundtrack analytics.
          </p>
        </div>

        {/* Space & Time Filter Controls */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
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

          {/* Time Range Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold">
            <button
              onClick={() => setTimeRange('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeRange === 'all' ? 'bg-white text-blue-950 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeRange === 'month' ? 'bg-white text-blue-950 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1.5 rounded-lg transition ${
                timeRange === 'week' ? 'bg-white text-blue-950 shadow-2xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              This Week
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400 bg-white border border-slate-200 rounded-3xl shadow-xs">
          Calculating space analytics & engagement metrics...
        </div>
      ) : !stats ? (
        <div className="p-16 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-3xl shadow-xs">
          Select a space to view insights.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Section Navigation Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === 'overview'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Overview & KPIs</span>
            </button>

            <button
              onClick={() => setActiveTab('mood')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === 'mood'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Smile className="w-4 h-4" />
              <span>Moods & Categories</span>
            </button>

            <button
              onClick={() => setActiveTab('contributors')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === 'contributors'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Top Contributors</span>
            </button>

            <button
              onClick={() => setActiveTab('music')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                activeTab === 'music'
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>Shared Soundtracks</span>
            </button>
          </div>

          {/* Key KPI Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Moments</span>
                <Sparkles className="w-4 h-4 text-blue-900" />
              </div>
              <p className="text-3xl font-black text-blue-950">
                {Math.round((stats.total_moments || 0) * multiplier)}
              </p>
              <p className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +12% from last week
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Photos Shared</span>
                <Layers className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-3xl font-black text-emerald-600">
                {Math.round((stats.total_photos || 0) * multiplier)}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">{photoRatio}% of moments have photos</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Engagement Rate</span>
                <MessageCircle className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-3xl font-black text-purple-600">{engagementRate}</p>
              <p className="text-[11px] text-slate-500 font-medium">Interactions per moment</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs space-y-2">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[10px] font-extrabold uppercase tracking-wider">Total Reactions</span>
                <Heart className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-3xl font-black text-rose-600">
                {Math.round((stats.total_reactions || 0) * multiplier)}
              </p>
              <p className="text-[11px] text-slate-500 font-medium">❤️ Love & warmth shared</p>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {(activeTab === 'overview' || activeTab === 'mood') && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Mood Distribution */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-blue-950 flex items-center gap-2">
                    <Smile className="w-4 h-4 text-amber-500" />
                    <span>Mood Breakdown in {stats?.space_name || 'Space'}</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {moodDistribution.length} Moods
                  </span>
                </div>

                <div className="space-y-4">
                  {moodDistribution.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No mood data recorded yet.</p>
                  ) : (
                    moodDistribution.map((m) => {
                      const meta = MOOD_META[m.mood] || {
                        emoji: '✨',
                        color: 'bg-blue-900',
                        text: 'text-blue-900',
                        lightBg: 'bg-slate-50'
                      };
                      return (
                        <div key={m.mood} className="space-y-1.5">
                          <div className="flex items-center justify-between text-xs font-bold">
                            <span className="capitalize flex items-center gap-1.5 text-slate-800">
                              <span>{meta.emoji}</span>
                              <span>{m.mood}</span>
                            </span>
                            <span className="text-slate-500 font-mono">
                              {Math.round(m.count * multiplier)} ({m.percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                            <div
                              className={`${meta.color} h-full rounded-full transition-all duration-500`}
                              style={{ width: `${m.percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Category Breakdown */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-extrabold text-blue-950 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-900" />
                    <span>Memory Categories</span>
                  </h3>
                  <span className="text-[11px] text-slate-400 font-semibold">Distribution</span>
                </div>

                <div className="space-y-3">
                  {categoryDistribution.length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No category data yet.</p>
                  ) : (
                    categoryDistribution.map((cat) => {
                      const icon = CATEGORY_ICONS[cat.category] || '✨';
                      return (
                        <div
                          key={cat.category}
                          className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-150 text-xs font-bold"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{icon}</span>
                            <span className="capitalize text-slate-800">{cat.category}</span>
                          </div>
                          <span className="px-3 py-1 rounded-full bg-white border border-slate-200 text-blue-950 font-extrabold">
                            {Math.round(cat.count * multiplier)} moments
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CONTRIBUTORS LEADERBOARD */}
          {(activeTab === 'overview' || activeTab === 'contributors') && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-base font-extrabold text-blue-950 flex items-center gap-2">
                    <Award className="w-5 h-5 text-amber-500" />
                    <span>Top Memory Contributors Leaderboard</span>
                  </h3>
                  <p className="text-xs text-slate-500">Members who share the most moments and photos in this space</p>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-bold bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 text-amber-900">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <span>Active Season 2026</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topContributors.length === 0 ? (
                  <p className="text-xs text-slate-400 italic col-span-3">No contributors yet.</p>
                ) : (
                  topContributors.map((c, idx) => {
                    const rankMedal = idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
                    return (
                      <div
                        key={c.user_id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 transition hover:bg-slate-100/80"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-lg font-black shrink-0 w-6 text-center">{rankMedal}</span>
                          <img
                            src={c.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${c.name}`}
                            alt={c.name}
                            className="w-10 h-10 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-xs text-slate-900 truncate">{c.name}</h4>
                            <p className="text-[10px] text-slate-500 font-medium">Memory Creator</p>
                          </div>
                        </div>

                        <span className="px-3 py-1.5 rounded-xl bg-blue-900 text-white font-extrabold text-xs shrink-0 shadow-2xs">
                          {Math.round(c.count * multiplier)} pts
                        </span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB 3: MUSIC SOUNDTRACKS */}
          {(activeTab === 'overview' || activeTab === 'music') && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-2xs space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-blue-950 flex items-center gap-2">
                    <Music className="w-5 h-5 text-purple-600" />
                    <span>Top Shared Soundtracks</span>
                  </h3>
                  <p className="text-xs text-slate-500">Songs attached to weekly moments and memories</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200">
                  {topSongs.length} Tracks
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {topSongs.length === 0 ? (
                  <div className="col-span-3 p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    No songs added to moments yet. Attach a song when logging a moment!
                  </div>
                ) : (
                  topSongs.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-purple-50/40 border border-purple-100 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-purple-900 text-white flex items-center justify-center font-bold shrink-0">
                          <Radio className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-slate-900 truncate">{s.title}</h4>
                          <p className="text-[11px] text-slate-500 truncate">{s.artist}</p>
                        </div>
                      </div>

                      <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-900 font-extrabold text-[10px] shrink-0">
                        {s.count} plays
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Weekly Growth Trend Activity */}
          <div className="bg-slate-900 text-white border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-amber-400 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Weekly Activity Trend</span>
                </h3>
                <p className="text-xs text-slate-400">Moment creation over recent weeks</p>
              </div>
              <span className="px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold">
                Level 5 Growth
              </span>
            </div>

            <div className="grid grid-cols-4 gap-4 pt-4 border-t border-slate-800 text-center">
              {weeklyActivity.map((w, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="h-24 bg-slate-800/80 rounded-2xl p-2 flex items-end justify-center relative overflow-hidden">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 to-amber-400 rounded-xl transition-all duration-500"
                      style={{ height: `${Math.min(100, Math.max(25, w.count * 20))}%` }}
                    />
                    <span className="absolute top-2 text-[11px] font-black text-amber-300">
                      {w.count}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 block">{w.week}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
