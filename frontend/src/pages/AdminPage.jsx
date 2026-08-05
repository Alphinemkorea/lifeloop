import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { AdminPasswordModal } from '../components/AdminPasswordModal.jsx';
import { Shield, Database, Users, Trash2, RefreshCw, AlertTriangle, KeyRound, Sparkles, Palette, Check } from 'lucide-react';

export const AdminPage = () => {
  const { user, token } = useAuth();
  const { theme, setTheme, THEMES, isAdminVerified, verifyAdmin } = useSettings();
  const [showPasswordModal, setShowPasswordModal] = useState(!isAdminVerified);

  // Fetch admin stats and users list
  const { data: stats, refetch: refetchStats } = useFetch(isAdminVerified ? '/api/admin/stats' : '');
  const { data: usersRes, refetch: refetchUsers } = useFetch(isAdminVerified ? '/api/admin/users?per_page=20' : '');

  const [resetting, setResetting] = useState(false);
  const [msg, setMsg] = useState(null);

  const handleResetData = async () => {
    if (!window.confirm('WARNING: Reset database to seed data? All custom moments will be restored to default.')) return;
    if (!token) return;

    setResetting(true);
    try {
      const res = await fetch('/api/admin/reset-data', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setMsg('Database reset to initial seed data successfully!');
        refetchStats();
        refetchUsers();
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  if (!isAdminVerified) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-3xl text-center space-y-4 shadow-md text-slate-800">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center">
          <Shield className="w-6 h-6 text-amber-900" />
        </div>
        <h1 className="text-xl font-black text-blue-950">Admin Verification Required</h1>
        <p className="text-xs text-slate-500">
          Enter admin password to view system usage statistics and management tools.
        </p>

        <button
          onClick={() => setShowPasswordModal(true)}
          className="px-5 py-2.5 bg-blue-900 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
        >
          Enter Admin Password
        </button>

        <AdminPasswordModal
          isOpen={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          onVerified={() => {
            refetchStats();
            refetchUsers();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 text-slate-800">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-900" />
            <h1 className="text-xl md:text-2xl font-black text-blue-950">System Admin Dashboard</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Global metrics, seed data management, user accounts, and platform controls.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleResetData}
            disabled={resetting}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
            <span>Reset Database to Seed Data</span>
          </button>

          <button
            onClick={() => verifyAdmin(false)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-bold transition"
          >
            Lock Admin
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold">
          {msg}
        </div>
      )}

      {/* Global Theme Selector */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 text-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-pink-50 text-pink-600 border border-pink-100">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-extrabold text-blue-950">System Color Themes</h2>
              <p className="text-[11px] text-slate-500">
                Change the primary color palette and canvas theme across the entire application
              </p>
            </div>
          </div>
          <span className="text-xs font-extrabold px-3 py-1 bg-pink-100 text-pink-900 rounded-full border border-pink-200 shrink-0 self-start sm:self-auto">
            Active: {THEMES.find((t) => t.id === theme)?.name || theme}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {THEMES.map((t) => {
            const isActive = theme === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTheme(t.id)}
                className={`p-4 rounded-2xl border text-left transition flex flex-col justify-between gap-3 relative overflow-hidden group ${
                  isActive
                    ? 'border-2 border-pink-600 bg-pink-50/40 shadow-sm ring-2 ring-pink-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                    {t.name}
                  </span>
                  {isActive && (
                    <span className="text-[10px] font-black px-2 py-0.5 bg-pink-600 text-white rounded-full flex items-center gap-1">
                      <Check className="w-3 h-3" /> Selected
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 leading-snug">{t.description}</p>

                {/* Color preview bar */}
                <div className="flex items-center gap-1.5 pt-1">
                  {t.preview.map((colorHex, i) => (
                    <span
                      key={i}
                      className="w-5 h-5 rounded-full border border-slate-300/80 shadow-2xs shrink-0"
                      style={{ backgroundColor: colorHex }}
                      title={`Preview ${colorHex}`}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Stat Cards */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Users</span>
            <p className="text-2xl font-black text-blue-950">{stats.total_users}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Spaces</span>
            <p className="text-2xl font-black text-blue-900">{stats.total_spaces}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Moments</span>
            <p className="text-2xl font-black text-emerald-600">{stats.total_moments}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Comments</span>
            <p className="text-2xl font-black text-purple-600">{stats.total_comments}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Reactions</span>
            <p className="text-2xl font-black text-rose-600">{stats.total_reactions}</p>
          </div>
        </div>
      )}

      {/* Users Table */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-extrabold text-blue-950 flex items-center gap-2">
          <Users className="w-4 h-4 text-blue-900" />
          <span>Registered System Users</span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                <th className="py-2 px-3">User</th>
                <th className="py-2 px-3">Email</th>
                <th className="py-2 px-3">Role</th>
                <th className="py-2 px-3">Age</th>
                <th className="py-2 px-3">Instagram</th>
                <th className="py-2 px-3">Moments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {usersRes?.data.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-2.5 px-3 font-bold text-blue-950 flex items-center gap-2">
                    <img
                      src={u.profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.full_name}`}
                      alt={u.full_name}
                      className="w-7 h-7 rounded-lg object-cover bg-slate-100 border border-slate-200"
                    />
                    <span>{u.full_name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{u.email}</td>
                  <td className="py-2.5 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      u.role === 'admin' ? 'bg-amber-100 text-amber-900' : 'bg-blue-50 text-blue-900'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-600">{u.profile?.age || '-'}</td>
                  <td className="py-2.5 px-3 text-pink-600 font-mono">{u.profile?.instagram_handle || '-'}</td>
                  <td className="py-2.5 px-3 font-bold text-slate-700">{u.moments_count || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
