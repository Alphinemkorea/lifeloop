import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { useSettings } from '../context/SettingsContext.jsx';
import { ShieldAlert, KeyRound, Lock, CheckCircle2 } from 'lucide-react';

export const AdminPasswordModal = ({ isOpen, onClose, onVerified }) => {
  const { user } = useAuth();
  const { verifyAdmin } = useSettings();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/verify-admin-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          user_id: user?.id
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        verifyAdmin(true);
        if (onVerified) onVerified();
        onClose();
      } else {
        throw new Error(data.error || 'Invalid admin password');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl space-y-5 text-slate-800">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center text-amber-900">
            <ShieldAlert className="w-6 h-6 text-amber-900" />
          </div>
          <h2 className="text-lg font-black text-blue-950">Admin Verification Required</h2>
          <p className="text-xs text-slate-500">
            Enter admin password to access system metrics and moderation tools.
          </p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-blue-950 mb-1 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-blue-900" />
              <span>Admin Password</span>
            </label>
            <input
              type="password"
              placeholder="Enter admin password (e.g., admin123)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900 font-mono text-xs"
              required
            />
            <p className="text-[10px] text-slate-400 mt-1">Default test admin password: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">admin123</code></p>
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              className="flex-1 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold shadow-md disabled:opacity-50 transition"
            >
              {loading ? 'Verifying...' : 'Unlock Admin Mode'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
