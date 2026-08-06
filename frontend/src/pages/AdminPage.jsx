import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../hooks/useAuth.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { useFetch } from '../hooks/useFetch.js';
import {
  Shield,
  Database,
  Users,
  Trash2,
  RefreshCw,
  Sparkles,
  Palette,
  Check,
  Megaphone,
  Sliders,
  UserCheck,
  Save,
  MessageSquare,
  Search,
  Filter,
  Eye,
  Activity,
  Layers,
  FileText,
  AlertCircle,
  X,
  ChevronRight,
  UserX,
  Lock,
  Download
} from 'lucide-react';

export const AdminPage = () => {
  const { user, token } = useAuth();
  const { theme, setTheme, THEMES } = useSettings();

  // Active Tab: 'overview' | 'users' | 'moments' | 'announcements' | 'themes'
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch stats, users, moments directly
  const { data: stats, refetch: refetchStats } = useFetch(token ? '/api/admin/stats' : '');
  const { data: usersRes, refetch: refetchUsers } = useFetch(token ? '/api/admin/users?per_page=100' : '');
  const { data: adminMomentsRes, refetch: refetchAdminMoments } = useFetch(token ? '/api/admin/moments' : '');

  // Filter & Search states
  const [userSearch, setUserSearch] = useState('');
  const [userRoleFilter, setUserRoleFilter] = useState('all'); // 'all' | 'admin' | 'user'
  
  const [momentSearch, setMomentSearch] = useState('');
  const [selectedMoment, setSelectedMoment] = useState(null); // for inspecting full moment details

  // Announcement & Feature Settings State
  const [siteSettings, setSiteSettings] = useState({
    announcement_enabled: true,
    announcement_text: '📢 Welcome to LifeLoop! Join spaces, share weekly moments, and grow memory trees with your friends.',
    announcement_type: 'info',
    ai_reflection_enabled: true,
    comments_enabled: true,
    public_spaces_enabled: true,
    site_tagline: 'Private Memory Spaces & Scrapbooks'
  });

  const [savingSettings, setSavingSettings] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    fetch('/api/admin/site-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) {
          setSiteSettings((prev) => ({ ...prev, ...data.settings }));
        }
      })
      .catch(console.error);
  }, []);

  const showToast = (message, type = 'success') => {
    setMsg({ text: message, type });
    setTimeout(() => setMsg(null), 3500);
  };

  const handleSaveSiteSettings = async (e) => {
    e?.preventDefault();
    if (!token) return;
    setSavingSettings(true);
    try {
      const res = await fetch('/api/admin/site-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(siteSettings)
      });
      if (res.ok) {
        showToast('Site settings & announcement banner updated!');
      } else {
        showToast('Failed to save settings', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Network error saving settings', 'error');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleToggleUserRole = async (targetUser) => {
    if (!token) return;
    const newRole = targetUser.role === 'admin' ? 'user' : 'admin';
    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`Role updated for ${targetUser.full_name} ➔ ${newRole.toUpperCase()}`);
        refetchUsers();
      } else {
        alert(data.error || 'Failed to update user role');
      }
    } catch (err) {
      console.error(err);
      alert('Network error updating user role.');
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (!window.confirm(`Are you sure you want to permanently delete user "${targetUser.full_name}" and all their moments?`)) return;
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/users/${targetUser.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`User ${targetUser.full_name} deleted successfully.`);
        refetchUsers();
        refetchStats();
      } else {
        alert(data.error || 'Failed to delete user');
      }
    } catch (err) {
      console.error(err);
      alert('Network error deleting user.');
    }
  };

  const handleDeleteMoment = async (momentId, title) => {
    if (!window.confirm(`Are you sure you want to remove moment "${title}"?`)) return;
    if (!token) return;
    try {
      const res = await fetch(`/api/admin/moments/${momentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        showToast(`Deleted moment "${title}"`);
        if (selectedMoment?.id === momentId) setSelectedMoment(null);
        refetchAdminMoments();
        refetchStats();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownloadBackup = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/admin/backup', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', jsonString);
        downloadAnchor.setAttribute('download', `lifeloop_backup_${new Date().toISOString().slice(0, 10)}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast('Database JSON backup downloaded!');
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        showToast('Database reset to initial sample seed data!');
        refetchStats();
        refetchUsers();
        refetchAdminMoments();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setResetting(false);
    }
  };

  // Filtered list calculations
  const allUsers = usersRes?.data || [];
  const filteredUsers = allUsers.filter((u) => {
    const matchesSearch =
      !userSearch ||
      u.full_name?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = userRoleFilter === 'all' || u.role === userRoleFilter;
    return matchesSearch && matchesRole;
  });

  const allMoments = adminMomentsRes?.moments || [];
  const filteredMoments = allMoments.filter(
    (m) =>
      !momentSearch ||
      m.title?.toLowerCase().includes(momentSearch.toLowerCase()) ||
      m.author_name?.toLowerCase().includes(momentSearch.toLowerCase()) ||
      m.author_email?.toLowerCase().includes(momentSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 text-slate-800">
      {/* Dynamic Toast Notification */}
      <AnimatePresence>
        {msg && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl shadow-xl font-bold text-xs flex items-center gap-2 border ${
              msg.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-emerald-950 text-emerald-200 border-emerald-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{msg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black uppercase tracking-wider">
              <Shield className="w-3.5 h-3.5 fill-amber-300" />
              <span>Admin Control Center</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
              System Governance & Operations
            </h1>
            <p className="text-xs md:text-sm text-slate-300 max-w-xl leading-relaxed">
              Manage platform members, assign administrator privileges, moderate public moments, broadcast live site announcements, and export database state.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleDownloadBackup}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold transition border border-white/20 backdrop-blur-xs shadow-xs"
              title="Download full JSON database snapshot"
            >
              <Download className="w-4 h-4 text-amber-400" />
              <span>Export Backup</span>
            </button>

            <button
              onClick={handleResetData}
              disabled={resetting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-amber-950 text-xs font-black transition shadow-md disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${resetting ? 'animate-spin' : ''}`} />
              <span>{resetting ? 'Resetting...' : 'Reset DB Seed'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs">
        {[
          { id: 'overview', label: 'Overview & Telemetry', icon: Activity },
          { id: 'users', label: `Users (${allUsers.length})`, icon: Users },
          { id: 'moments', label: `Moderation (${allMoments.length})`, icon: Sparkles },
          { id: 'announcements', label: 'Live Studio', icon: Megaphone },
          { id: 'themes', label: 'Color Themes', icon: Palette }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition relative ${
                isActive
                  ? 'bg-blue-950 text-white shadow-md'
                  : 'text-slate-600 hover:text-blue-950 hover:bg-slate-100'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content 1: Overview & Telemetry */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Key Metric Cards */}
          {stats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition space-y-2 relative overflow-hidden group">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-wider">Total Users</span>
                  <Users className="w-4 h-4 text-blue-950 group-hover:scale-110 transition" />
                </div>
                <p className="text-3xl font-black text-blue-950">{stats.total_users}</p>
                <div className="text-[10px] text-slate-400 font-medium">Registered accounts</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition space-y-2 relative overflow-hidden group">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-wider">Memory Spaces</span>
                  <Layers className="w-4 h-4 text-blue-900 group-hover:scale-110 transition" />
                </div>
                <p className="text-3xl font-black text-blue-900">{stats.total_spaces}</p>
                <div className="text-[10px] text-slate-400 font-medium">Active space rooms</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition space-y-2 relative overflow-hidden group">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-wider">Shared Moments</span>
                  <Sparkles className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition" />
                </div>
                <p className="text-3xl font-black text-emerald-600">{stats.total_moments}</p>
                <div className="text-[10px] text-slate-400 font-medium">Weekly posts & logs</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition space-y-2 relative overflow-hidden group">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-wider">Comments</span>
                  <MessageSquare className="w-4 h-4 text-purple-600 group-hover:scale-110 transition" />
                </div>
                <p className="text-3xl font-black text-purple-600">{stats.total_comments}</p>
                <div className="text-[10px] text-slate-400 font-medium">Member replies</div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs hover:shadow-md transition space-y-2 relative overflow-hidden group">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[10px] font-black uppercase tracking-wider">Reactions</span>
                  <FileText className="w-4 h-4 text-rose-600 group-hover:scale-110 transition" />
                </div>
                <p className="text-3xl font-black text-rose-600">{stats.total_reactions}</p>
                <div className="text-[10px] text-slate-400 font-medium">Hearts & feedback</div>
              </div>
            </div>
          )}

          {/* Platform Status & Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-extrabold text-blue-950 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Activity className="w-4 h-4 text-emerald-600" />
                <span>System Health & Status</span>
              </h2>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <span className="font-bold text-emerald-950 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    Database Engine
                  </span>
                  <span className="text-[11px] font-black text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                    OPERATIONAL (JSON Persistence)
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-blue-50 border border-blue-100">
                  <span className="font-bold text-blue-950">Active Admin Session</span>
                  <span className="text-[11px] font-bold text-blue-800">{user?.full_name} ({user?.email})</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                  <span className="font-bold text-slate-700">Platform Security</span>
                  <span className="text-[11px] font-bold text-slate-600">JWT Token Auth Enabled</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h2 className="text-sm font-extrabold text-blue-950 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sliders className="w-4 h-4 text-amber-500" />
                <span>Quick Administration Shortcuts</span>
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setActiveTab('users')}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-blue-900 bg-slate-50 hover:bg-white text-left transition space-y-1 group"
                >
                  <Users className="w-5 h-5 text-blue-900 group-hover:scale-110 transition" />
                  <span className="font-extrabold text-xs text-blue-950 block">Manage Users</span>
                  <span className="text-[10px] text-slate-500 block">Promote or delete accounts</span>
                </button>

                <button
                  onClick={() => setActiveTab('moments')}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-amber-500 bg-slate-50 hover:bg-white text-left transition space-y-1 group"
                >
                  <Sparkles className="w-5 h-5 text-amber-500 group-hover:scale-110 transition" />
                  <span className="font-extrabold text-xs text-blue-950 block">Moderate Moments</span>
                  <span className="text-[10px] text-slate-500 block">Inspect and filter posts</span>
                </button>

                <button
                  onClick={() => setActiveTab('announcements')}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-600 bg-slate-50 hover:bg-white text-left transition space-y-1 group"
                >
                  <Megaphone className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition" />
                  <span className="font-extrabold text-xs text-blue-950 block">Update MOTD</span>
                  <span className="text-[10px] text-slate-500 block">Broadcast live website text</span>
                </button>

                <button
                  onClick={handleDownloadBackup}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-600 bg-slate-50 hover:bg-white text-left transition space-y-1 group"
                >
                  <Download className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition" />
                  <span className="font-extrabold text-xs text-blue-950 block">Export Backup</span>
                  <span className="text-[10px] text-slate-500 block">Save full JSON snapshot</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab Content 2: Users Management */}
      {activeTab === 'users' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-black text-blue-950 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-900" />
                <span>Registered Users & Role Governance</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Promote members to Admin, revoke permissions, or delete accounts cleanly.
              </p>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-900 w-60"
                />
              </div>

              <select
                value={userRoleFilter}
                onChange={(e) => setUserRoleFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none focus:border-blue-900"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admins Only</option>
                <option value="user">Members Only</option>
              </select>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-bold flex items-center justify-between">
            <span>Showing {filteredUsers.length} of {allUsers.length} total registered accounts</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-3 px-3">User Profile</th>
                  <th className="py-3 px-3">Email Address</th>
                  <th className="py-3 px-3">Current Role</th>
                  <th className="py-3 px-3">Shared Moments</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isCurrentUser = u.id === user?.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition group">
                      <td className="py-3.5 px-3 font-bold text-blue-950 flex items-center gap-3">
                        <img
                          src={u.profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${u.full_name}`}
                          alt={u.full_name}
                          className="w-9 h-9 rounded-xl object-cover bg-slate-100 border border-slate-200 shrink-0"
                        />
                        <div>
                          <span className="block text-xs font-black">{u.full_name}</span>
                          {isCurrentUser && (
                            <span className="inline-block text-[9px] text-emerald-700 font-black bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 mt-0.5">
                              YOU (Logged-in)
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-mono text-xs">{u.email}</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1.5 ${
                            u.role === 'admin'
                              ? 'bg-amber-100 text-amber-950 border border-amber-300 shadow-2xs'
                              : 'bg-blue-50 text-blue-900 border border-blue-200'
                          }`}
                        >
                          {u.role === 'admin' ? <Shield className="w-3.5 h-3.5 fill-amber-950" /> : <Users className="w-3.5 h-3.5" />}
                          <span className="uppercase">{u.role}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-3 font-extrabold text-slate-700">{u.moments_count || 0}</td>
                      <td className="py-3.5 px-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggleUserRole(u)}
                            disabled={isCurrentUser}
                            className={`px-3 py-1.5 rounded-xl text-[11px] font-extrabold transition flex items-center gap-1.5 shadow-2xs ${
                              u.role === 'admin'
                                ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 disabled:opacity-40'
                                : 'bg-amber-400 hover:bg-amber-300 text-amber-950 disabled:opacity-40'
                            }`}
                            title={isCurrentUser ? 'Cannot modify your own role' : 'Toggle between Admin and Member role'}
                          >
                            <Shield className="w-3.5 h-3.5" />
                            <span>{u.role === 'admin' ? 'Demote to Member' : 'Promote to Admin'}</span>
                          </button>

                          <button
                            onClick={() => handleDeleteUser(u)}
                            disabled={isCurrentUser}
                            className="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-[11px] font-extrabold transition flex items-center gap-1 shadow-2xs disabled:opacity-40"
                            title={isCurrentUser ? 'Cannot delete your own logged-in account' : 'Permanently delete user account'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete User</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Tab Content 3: Content Moderation Hub */}
      {activeTab === 'moments' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-black text-blue-950 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <span>Moment Content Moderation & Rapid Removal</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Inspect moments across spaces and delete policy-violating posts in one click.
              </p>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search moments or authors..."
                value={momentSearch}
                onChange={(e) => setMomentSearch(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-800 focus:outline-none focus:border-blue-900 w-full sm:w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px] font-bold">
                  <th className="py-2.5 px-3">Moment Title & Details</th>
                  <th className="py-2.5 px-3">Author</th>
                  <th className="py-2.5 px-3">Space Room</th>
                  <th className="py-2.5 px-3">Created Date</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredMoments.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3 px-3 font-bold text-blue-950">
                      <div className="flex items-center gap-2">
                        <span className="block font-black truncate max-w-xs">{m.title}</span>
                        <button
                          onClick={() => setSelectedMoment(m)}
                          className="px-2 py-0.5 bg-blue-50 text-blue-900 rounded hover:bg-blue-100 text-[10px] font-bold flex items-center gap-1 shrink-0"
                          title="Inspect Moment"
                        >
                          <Eye className="w-3 h-3" /> Inspect
                        </button>
                      </div>
                      {m.reflection && (
                        <span className="block text-[10px] text-slate-500 font-normal italic truncate max-w-xs mt-0.5">
                          "{m.reflection}"
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      <span className="font-semibold block">{m.author_name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{m.author_email}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-semibold text-[10px]">
                        {m.space_name}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[10px]">
                      {m.created_at ? new Date(m.created_at).toLocaleDateString() : 'Recent'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleDeleteMoment(m.id, m.title)}
                        className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-[11px] font-extrabold transition flex items-center gap-1 ml-auto shadow-2xs"
                        title="Delete moment from system"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* Moment Inspection Modal */}
      <AnimatePresence>
        {selectedMoment && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 relative"
            >
              <button
                onClick={() => setSelectedMoment(null)}
                className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-950 text-[10px] font-black uppercase">
                  Moment Inspector
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {selectedMoment.id}</span>
              </div>

              <h3 className="text-lg font-black text-blue-950">{selectedMoment.title}</h3>

              {selectedMoment.photo_url && (
                <img
                  src={selectedMoment.photo_url}
                  alt={selectedMoment.title}
                  className="w-full h-48 object-cover rounded-2xl border border-slate-200"
                />
              )}

              {selectedMoment.reflection && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-700 italic">
                  "{selectedMoment.reflection}"
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 pt-3">
                <div>
                  <span className="block font-bold text-slate-800">{selectedMoment.author_name}</span>
                  <span className="text-[10px] text-slate-400">{selectedMoment.author_email}</span>
                </div>

                <button
                  onClick={() => handleDeleteMoment(selectedMoment.id, selectedMoment.title)}
                  className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete Moment</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tab Content 4: Announcement Live Studio */}
      {activeTab === 'announcements' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Live Banner Preview Box */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-blue-900" />
              <span>Real-Time Live Banner Preview</span>
            </h3>

            {siteSettings.announcement_enabled ? (
              <div
                className={`p-3.5 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-2xs ${
                  siteSettings.announcement_type === 'info'
                    ? 'bg-blue-950 text-white border-blue-900'
                    : siteSettings.announcement_type === 'success'
                    ? 'bg-emerald-900 text-white border-emerald-800'
                    : siteSettings.announcement_type === 'warning'
                    ? 'bg-amber-400 text-amber-950 border-amber-500 font-black'
                    : 'bg-rose-900 text-white border-rose-800'
                }`}
              >
                <span>{siteSettings.announcement_text || 'No text set...'}</span>
                <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-black/20 font-black shrink-0">
                  LIVE PREVIEW
                </span>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 text-slate-500 text-xs italic">
                Banner is currently DISABLED by administrator.
              </div>
            )}
          </div>

          <form onSubmit={handleSaveSiteSettings} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
                  <Megaphone className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-base font-black text-blue-950">Site Banners & Global Announcement Studio</h2>
                  <p className="text-xs text-slate-500">
                    Broadcast messages instantly across top navigation for all active members
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={savingSettings}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-black transition shadow-md shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>{savingSettings ? 'Saving...' : 'Save Settings'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
              <div className="md:col-span-2 space-y-2">
                <label className="font-extrabold text-slate-800 block">Announcement Banner Content</label>
                <input
                  type="text"
                  value={siteSettings.announcement_text}
                  onChange={(e) => setSiteSettings({ ...siteSettings, announcement_text: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-900 font-medium text-xs"
                  placeholder="e.g. 📢 Join our new weekly scrapbook challenge!"
                />
              </div>

              <div className="space-y-2">
                <label className="font-extrabold text-slate-800 block">Banner Alert Style</label>
                <select
                  value={siteSettings.announcement_type}
                  onChange={(e) => setSiteSettings({ ...siteSettings, announcement_type: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-900 font-bold text-xs"
                >
                  <option value="info">🔵 Information (Navy Blue)</option>
                  <option value="success">🟢 Success (Emerald Green)</option>
                  <option value="warning">🟡 Notice (Amber Gold)</option>
                  <option value="emergency">🔴 Urgent (Rose Red)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-3">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-blue-900" />
                <span>Feature Capability Switches</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <label className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/70 cursor-pointer hover:bg-white transition">
                  <input
                    type="checkbox"
                    checked={siteSettings.announcement_enabled}
                    onChange={(e) => setSiteSettings({ ...siteSettings, announcement_enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-900 focus:ring-blue-900"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Enable Banner</span>
                    <span className="text-[10px] text-slate-500">Show text at top of screen</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/70 cursor-pointer hover:bg-white transition">
                  <input
                    type="checkbox"
                    checked={siteSettings.ai_reflection_enabled}
                    onChange={(e) => setSiteSettings({ ...siteSettings, ai_reflection_enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-900 focus:ring-blue-900"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">AI Reflection Engine</span>
                    <span className="text-[10px] text-slate-500">Enable AI memory prompts</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 bg-slate-50/70 cursor-pointer hover:bg-white transition">
                  <input
                    type="checkbox"
                    checked={siteSettings.public_spaces_enabled}
                    onChange={(e) => setSiteSettings({ ...siteSettings, public_spaces_enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-900 focus:ring-blue-900"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block text-xs">Public Spaces Creation</span>
                    <span className="text-[10px] text-slate-500">Allow users to build rooms</span>
                  </div>
                </label>
              </div>
            </div>
          </form>
        </motion.div>
      )}

      {/* Tab Content 5: System Themes */}
      {activeTab === 'themes' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-pink-50 text-pink-600 border border-pink-100">
                <Palette className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-base font-black text-blue-950">System Color Themes</h2>
                <p className="text-xs text-slate-500">
                  Switch application color themes globally across navigation and cards
                </p>
              </div>
            </div>
            <span className="text-xs font-black px-3.5 py-1 bg-pink-100 text-pink-900 rounded-full border border-pink-200 shrink-0">
              Active Theme: {THEMES.find((t) => t.id === theme)?.name || theme}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {THEMES.map((t) => {
              const isActive = theme === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setTheme(t.id);
                    showToast(`Switched system theme to "${t.name}"`);
                  }}
                  className={`p-5 rounded-2xl border text-left transition flex flex-col justify-between gap-4 relative overflow-hidden group ${
                    isActive
                      ? 'border-2 border-pink-600 bg-pink-50/40 shadow-sm ring-2 ring-pink-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-black text-xs text-slate-900 flex items-center gap-1.5">
                      {t.name}
                    </span>
                    {isActive && (
                      <span className="text-[10px] font-black px-2 py-0.5 bg-pink-600 text-white rounded-full flex items-center gap-1">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-500 leading-snug">{t.description}</p>

                  <div className="flex items-center gap-2 pt-1">
                    {t.preview.map((colorHex, i) => (
                      <span
                        key={i}
                        className="w-6 h-6 rounded-full border border-slate-300 shadow-2xs shrink-0"
                        style={{ backgroundColor: colorHex }}
                        title={`Preview ${colorHex}`}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
};
