import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { copyToClipboard } from '../utils/api.js';
import { X, Users, Sparkles, Hash, Copy, Check, Share2, ArrowRight } from 'lucide-react';

export const CreateSpaceModal = ({ isOpen, onClose, onSpaceCreated }) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🌿');
  const [customCode, setCustomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdSpace, setCreatedSpace] = useState(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedMsg, setCopiedMsg] = useState(false);

  if (!isOpen) return null;

  const emojiOptions = ['🌿', '🏕️', '☕', '🎓', '🏖️', '🚀', '🎨', '🍕', '🎮', '🏠'];

  const handleResetAndClose = () => {
    setName('');
    setDescription('');
    setCustomCode('');
    setCreatedSpace(null);
    setCopiedCode(false);
    setCopiedMsg(false);
    setError(null);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/spaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name,
          description,
          icon,
          custom_code: customCode
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create space');
      }

      if (onSpaceCreated) onSpaceCreated(data.space);
      setCreatedSpace(data.space);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (createdSpace?.invite_code) {
      const ok = await copyToClipboard(createdSpace.invite_code);
      if (ok) {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2500);
      }
    }
  };

  const handleCopyShareMessage = async () => {
    if (createdSpace) {
      const shareMsg = `Join my space "${createdSpace.name}" on LifeLoop using code: ${createdSpace.invite_code}`;
      const ok = await copyToClipboard(shareMsg);
      if (ok) {
        setCopiedMsg(true);
        setTimeout(() => setCopiedMsg(false), 2500);
      }
    }
  };

  const handleGoToSpace = () => {
    const spaceId = createdSpace?.id;
    handleResetAndClose();
    if (spaceId) {
      navigate(`/spaces/${spaceId}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl space-y-5 text-slate-800">
        
        {/* SUCCESS VIEW AFTER CREATION */}
        {createdSpace ? (
          <div className="space-y-6 text-center animate-fade-in">
            <div className="flex justify-end">
              <button
                onClick={handleResetAndClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-200 text-3xl flex items-center justify-center mx-auto shadow-sm">
                {createdSpace.icon}
              </div>
              <h2 className="text-xl font-black text-blue-950">Space Created! 🎉</h2>
              <p className="text-xs text-slate-500 font-medium">
                <strong className="text-slate-800">{createdSpace.name}</strong> is ready for memories.
              </p>
            </div>

            {/* Invite Code Box */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <span className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider block">
                Your Space Invite Code
              </span>
              <div className="flex items-center justify-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdSpace.invite_code}
                  onClick={(e) => e.target.select()}
                  className="font-mono text-xl font-black text-blue-950 tracking-wider bg-white px-4 py-2 rounded-xl border border-blue-200 shadow-2xs text-center w-full max-w-[200px] select-all cursor-pointer focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  title="Click to select code"
                />
              </div>

              <div className="flex items-center gap-2 justify-center pt-1">
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3.5 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-2xs transition"
                >
                  {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Code Copied!' : 'Copy Code'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyShareMessage}
                  className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs flex items-center gap-1.5 transition"
                >
                  {copiedMsg ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-600" />}
                  <span>{copiedMsg ? 'Message Copied!' : 'Copy Share Text'}</span>
                </button>
              </div>
            </div>

            <div className="bg-blue-50/80 border border-blue-100 p-3 rounded-2xl text-[11px] text-blue-950 text-left space-y-1">
              <span className="font-extrabold block">💡 How your friends join:</span>
              <p className="text-slate-600 leading-normal">
                1. Send them this code: <strong className="font-mono">{createdSpace.invite_code}</strong><br />
                2. Tell them to open LifeLoop and click <strong className="text-blue-950">"Join via Code"</strong>.<br />
                3. Paste the code and they're instantly in your space!
              </p>
            </div>

            <button
              onClick={handleGoToSpace}
              className="w-full py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition"
            >
              <span>Open Space Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* CREATION FORM */
          <>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center font-bold">
                  <Users className="w-4 h-4 text-blue-900" />
                </div>
                <div>
                  <h2 className="text-base font-black text-blue-950">Create a New Space</h2>
                  <p className="text-[11px] text-slate-500">Group scrapbook for family, squad, or project</p>
                </div>
              </div>
              <button
                onClick={handleResetAndClose}
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
              {/* Icon Selector */}
              <div>
                <label className="block font-bold text-blue-950 mb-1.5">Space Icon / Emoji</label>
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  {emojiOptions.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => setIcon(e)}
                      className={`w-9 h-9 rounded-xl border text-base flex items-center justify-center transition shrink-0 ${
                        icon === e ? 'bg-blue-100 border-blue-900 scale-105' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>

              {/* Space Name */}
              <div>
                <label className="block font-bold text-blue-950 mb-1">Space Name *</label>
                <input
                  type="text"
                  placeholder="e.g., Weekend Explorers, Class of 2026"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900 font-semibold"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-blue-950 mb-1">Short Description</label>
                <textarea
                  placeholder="What memories will be collected here?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900 h-20 resize-none"
                />
              </div>

              {/* Custom Invite Code */}
              <div>
                <label className="block font-bold text-blue-950 mb-1 flex items-center gap-1">
                  <Hash className="w-3.5 h-3.5 text-blue-900" />
                  <span>Custom Invite Code (Optional)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., SQUAD2026"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-mono text-xs uppercase focus:outline-none focus:border-blue-900"
                />
                <p className="text-[10px] text-slate-400 mt-0.5">Leave blank for auto-generated code</p>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleResetAndClose}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold shadow-md disabled:opacity-50 transition"
                >
                  {loading ? 'Creating...' : 'Create Space'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
};

