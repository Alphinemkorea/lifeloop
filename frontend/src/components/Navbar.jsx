import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { PlusCircle, Search, Shield, LogOut, User, Sparkles, Heart, Palette, Check } from 'lucide-react';

export const Navbar = ({ onOpenNewMomentModal, onOpenNewMoment }) => {
  const { user, profile, logout } = useAuth();
  const { theme, setTheme, THEMES } = useSettings();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showThemeMenu, setShowThemeMenu] = useState(false);

  const handleOpenModal = onOpenNewMomentModal || onOpenNewMoment;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/moments?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-[1600px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-900 text-white flex items-center justify-center font-black shadow-sm">
            🌿
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-blue-950 flex items-center gap-1">
              LifeLoop
            </span>
            <span className="block text-[10px] text-slate-400 font-medium -mt-1">Memory Scrapbook</span>
          </div>
        </Link>

        {/* Global Search */}
        <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search memories, places, songs, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-blue-900 focus:bg-white transition"
            />
          </div>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">New Moment</span>
          </button>

          {/* Theme Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowThemeMenu(!showThemeMenu)}
              className="p-2 rounded-xl text-slate-500 hover:text-blue-950 hover:bg-slate-100 transition relative"
              title="Change Color Theme"
            >
              <Palette className="w-4 h-4" />
            </button>

            {showThemeMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowThemeMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-3 z-50 animate-fade-in max-h-96 overflow-y-auto space-y-1">
                  <div className="px-2 py-1.5 border-b border-slate-100 mb-1 flex items-center justify-between">
                    <span className="text-xs font-black text-blue-950 uppercase tracking-wider">
                      Color Themes
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {THEMES.length} Themes
                    </span>
                  </div>
                  {THEMES.map((t) => {
                    const isActive = theme === t.id;
                    return (
                      <button
                        key={t.id}
                        onClick={() => {
                          setTheme(t.id);
                          setShowThemeMenu(false);
                        }}
                        className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition ${
                          isActive
                            ? 'bg-blue-50 text-blue-900 font-extrabold border border-blue-200'
                            : 'hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5 shrink-0">
                            {t.preview.map((colorHex, i) => (
                              <span
                                key={i}
                                className="w-2.5 h-2.5 rounded-full border border-black/10"
                                style={{ backgroundColor: colorHex }}
                              />
                            ))}
                          </div>
                          <span className="truncate max-w-[150px]">{t.name}</span>
                        </div>
                        {isActive && <Check className="w-3.5 h-3.5 text-blue-900 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          <Link
            to="/admin"
            className="p-2 rounded-xl text-slate-500 hover:text-blue-950 hover:bg-slate-100 transition"
            title="Admin Dashboard"
          >
            <Shield className="w-4 h-4" />
          </Link>

          {/* Profile Dropdown / Link */}
          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <Link
                to="/profile"
                className="flex items-center gap-2 hover:opacity-80 transition"
                title="Your Profile"
              >
                <img
                  src={profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.full_name}`}
                  alt={user.full_name}
                  className="w-8 h-8 rounded-xl object-cover bg-slate-100 border border-slate-200"
                />
                <span className="hidden lg:inline text-xs font-bold text-slate-700 truncate max-w-[100px]">
                  {user.full_name.split(' ')[0]}
                </span>
              </Link>

              <button
                onClick={logout}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
