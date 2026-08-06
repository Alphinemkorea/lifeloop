import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { X, Hash, UserCheck, CheckCircle2 } from 'lucide-react';

export const JoinSpaceModal = ({ isOpen, onClose, onSpaceJoined }) => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [inviteCode, setInviteCode] = useState('');
  const [nickname, setNickname] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token || !inviteCode.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/spaces/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          invite_code: inviteCode.trim(),
          nickname: nickname.trim() || user?.full_name
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to join space');
      }

      setInviteCode('');
      setNickname('');

      if (onSpaceJoined) onSpaceJoined(data.space);
      onClose();

      if (data.space?.id) {
        navigate(`/spaces/${data.space.id}`);
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
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
              <Hash className="w-4 h-4 text-emerald-900" />
            </div>
            <div>
              <h2 className="text-base font-black text-blue-950">Join Space with Invite Code</h2>
              <p className="text-[11px] text-slate-500">Enter code shared by group owner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-blue-950 mb-1 flex items-center gap-1">
              <Hash className="w-3.5 h-3.5 text-blue-900" />
              <span>Invite Code *</span>
            </label>
            <input
              type="text"
              placeholder="e.g. SQUAD2026 or LIFE-8X9A"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-sm uppercase focus:outline-none focus:border-blue-900"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-blue-950 mb-1 flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-blue-900" />
              <span>Nickname in this Space (Optional)</span>
            </label>
            <input
              type="text"
              placeholder={user?.full_name || 'Your name'}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900"
            />
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
              disabled={loading || !inviteCode.trim()}
              className="flex-1 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold shadow-md disabled:opacity-50 transition"
            >
              {loading ? 'Joining Space...' : 'Join Space'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
