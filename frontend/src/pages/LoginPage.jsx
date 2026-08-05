import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { parseApiResponse } from '../utils/api.js';
import { Mail, Lock, LogIn, Sparkles, CheckCircle2 } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await parseApiResponse(res);

      login(data.token, data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 w-full max-w-md shadow-xl space-y-6 text-slate-800">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-900 text-white flex items-center justify-center font-black text-xl shadow-md">
            🌿
          </div>
          <h1 className="text-2xl font-black text-blue-950">Welcome Back to LifeLoop</h1>
          <p className="text-xs text-slate-500">Sign in to access your shared scrapbooks and memory spaces</p>
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
              <span>Email Address</span>
            </label>
            <input
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 focus:outline-none focus:border-blue-900 font-medium"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-blue-950 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-blue-900" />
              <span>Password</span>
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
            className="w-full py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : 'Sign In to LifeLoop'}</span>
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500 space-y-2">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-blue-900 hover:underline">
              Create Account!
            </Link>
          </p>

          <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-2xl text-[11px] text-blue-950 text-left space-y-1">
            <span className="font-bold block">Demo Credentials:</span>
            <span>User: <code className="font-mono bg-blue-100 px-1 py-0.5 rounded">alex@lifeloop.app</code> / <code className="font-mono bg-blue-100 px-1 py-0.5 rounded">password123</code></span>
          </div>
        </div>
      </div>
    </div>
  );
};
