import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { parseApiResponse } from '../utils/api.js';
import { Mail, Lock, LogIn, Shield, User, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const { verifyAdmin } = useSettings();
  const navigate = useNavigate();
  const location = useLocation();

  const [role, setRole] = useState('user'); // 'user' | 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [demoUsed, setDemoUsed] = useState(() => {
    return localStorage.getItem('lifeloop_demo_used') === 'true';
  });

  const from = location.state?.from?.pathname || '/';

  const handleRoleSwitch = (selectedRole) => {
    setRole(selectedRole);
    setError(null);
    setEmail('');
    setPassword('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          password,
          login_role: role
        })
      });

      const data = await parseApiResponse(res);

      if (role === 'admin' || data.user.role === 'admin') {
        verifyAdmin(true);
      }

      login(data.token, data.user);

      if (role === 'admin' || data.user.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 max-w-5xl mx-auto my-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full">
        {/* Left Column: App Intro & Feature Highlights */}
        <div className="lg:col-span-7 space-y-6 text-slate-800 pr-0 lg:pr-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-950 border border-blue-200 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-blue-900 animate-pulse" />
            <span>Introducing LifeLoop</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-950 tracking-tight leading-tight">
              Capture Life’s Best Moments Together 🌿
            </h1>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
              LifeLoop is your private, interactive digital scrapbook platform. Build private memory spaces with friends, share weekly moments with photos and music, and grow memory trees together.
            </p>
          </div>

          {/* Interactive Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="glass-card p-4 rounded-2xl space-y-1.5 transition">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center text-base font-black border border-amber-500/30">
                🏰
              </div>
              <h3 className="font-extrabold text-xs text-blue-950">Private Memory Spaces</h3>
              <p className="text-[11px] text-slate-500 leading-snug">
                Invite friends or family into cozy digital rooms to log shared adventures.
              </p>
            </div>

            <div className="glass-card p-4 rounded-2xl space-y-1.5 transition">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-base font-black border border-emerald-500/30">
                🌳
              </div>
              <h3 className="font-extrabold text-xs text-blue-950">Growing Memory Trees</h3>
              <p className="text-[11px] text-slate-500 leading-snug">
                Watch your space's interactive memory tree flourish with every post.
              </p>
            </div>

            <div className="glass-card p-4 rounded-2xl space-y-1.5 transition">
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center text-base font-black border border-purple-500/30">
                ✨
              </div>
              <h3 className="font-extrabold text-xs text-blue-950">AI Reflection Insights</h3>
              <p className="text-[11px] text-slate-500 leading-snug">
                Get smart AI memory summaries, emotional reflections, and nostalgic tags.
              </p>
            </div>

            <div className="glass-card p-4 rounded-2xl space-y-1.5 transition">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-300 flex items-center justify-center text-base font-black border border-rose-500/30">
                🎵
              </div>
              <h3 className="font-extrabold text-xs text-blue-950">Photos & Music Scrapbooks</h3>
              <p className="text-[11px] text-slate-500 leading-snug">
                Attach Spotify song previews, photo galleries, location pins, and reactions.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Login Portal Card */}
        <div className="lg:col-span-5 glass-panel rounded-3xl p-6 sm:p-8 space-y-6 text-slate-800 relative z-10">
          {/* Role Selector Tabs */}
          <div className="bg-slate-900/40 p-1.5 rounded-2xl flex items-center gap-1 border border-white/10 text-xs font-bold">
            <button
              type="button"
              onClick={() => handleRoleSwitch('user')}
              className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
                role === 'user'
                  ? 'bg-white text-blue-950 shadow-xs border border-slate-200/60 font-black'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <User className={`w-4 h-4 ${role === 'user' ? 'text-blue-900' : 'text-slate-400'}`} />
              <span>Member Login</span>
            </button>
            <button
              type="button"
              onClick={() => handleRoleSwitch('admin')}
              className={`flex-1 py-2.5 rounded-xl transition flex items-center justify-center gap-2 ${
                role === 'admin'
                  ? 'bg-amber-400 text-amber-950 shadow-xs border border-amber-300 font-black'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Shield className={`w-4 h-4 ${role === 'admin' ? 'text-amber-950 fill-amber-950' : 'text-slate-400'}`} />
              <span>Admin Login</span>
            </button>
          </div>

          {/* Header */}
          <div className="text-center space-y-1.5">
            <div
              className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center font-black text-xl shadow-md transition ${
                role === 'admin' ? 'bg-amber-400 text-amber-950' : 'bg-blue-900 text-white'
              }`}
            >
              {role === 'admin' ? '🛡️' : '🌿'}
            </div>
            <h2 className="text-2xl font-black text-blue-950">
              {role === 'admin' ? 'System Administrator Portal' : 'Sign In to LifeLoop'}
            </h2>
            <p className="text-xs text-slate-500">
              {role === 'admin'
                ? 'Access administrative controls, website themes, banner settings, and user permissions.'
                : 'Enter your email and password to access your memory spaces.'}
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-blue-950 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-blue-900" />
                <span>{role === 'admin' ? 'Admin Email Address' : 'Email Address'}</span>
              </label>
              <input
                type="email"
                placeholder={role === 'admin' ? 'mkorea@gmail.com' : 'alex@lifeloop.app'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-900 font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-blue-950 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-900" />
                <span>{role === 'admin' ? 'Admin Master Password' : 'Password'}</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-900 font-medium"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-black text-xs shadow-md disabled:opacity-50 transition flex items-center justify-center gap-2 ${
                role === 'admin'
                  ? 'bg-amber-400 hover:bg-amber-300 text-amber-950'
                  : 'bg-blue-900 hover:bg-blue-800 text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>
                {loading
                  ? 'Authenticating...'
                  : role === 'admin'
                  ? 'Sign In as Administrator'
                  : 'Sign In to LifeLoop'}
              </span>
            </button>
          </form>

          {/* Preset Quick Fill Demo */}
          <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500 space-y-3">
            {role === 'user' && !demoUsed && (
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-2xl text-[11px] text-blue-950 text-left space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-blue-900" />
                    <span>Initial Demo Account:</span>
                  </span>
                  <span className="text-[9px] bg-blue-200 text-blue-900 px-1.5 py-0.5 rounded font-extrabold uppercase">
                    1-Touch Fill
                  </span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span>
                    <code className="font-mono bg-white px-1.5 py-0.5 border border-blue-200 rounded">alex@lifeloop.app</code>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('alex@lifeloop.app');
                      setPassword('password123');
                      localStorage.setItem('lifeloop_demo_used', 'true');
                      setDemoUsed(true);
                    }}
                    className="px-2.5 py-1 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-lg text-[10px] shadow-xs transition"
                  >
                    Quick Fill
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-1">
              <p>
                Don't have an account yet?{' '}
                <Link to="/register" className="font-black text-blue-900 hover:underline">
                  Create an Account!
                </Link>
              </p>
              <p className="text-[11px] text-slate-400">
                New administrators can also register an admin account using the secret key.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
