import React, { useState, useEffect } from 'react';
import { X, Image as ImageIcon, Sparkles, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';

const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80'
];

const PRESET_ICONS = ['🌿', '⚡', '☕', '🎨', '🚀', '🌟', '🏖️', '🎧', '🎮', '⛺', '🍕', '🌸'];

export const EditSpaceModal = ({ isOpen, onClose, space, onSpaceUpdated }) => {
  const { token } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('🌿');
  const [coverUrl, setCoverUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (space) {
      setName(space.name || '');
      setDescription(space.description || '');
      setIcon(space.icon || '🌿');
      setCoverUrl(space.cover_url || PRESET_COVERS[0]);
      setError('');
    }
  }, [space, isOpen]);

  if (!isOpen || !space) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Space name is required.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/spaces/${space.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          icon,
          cover_url: coverUrl
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update space appearance.');
      }

      if (onSpaceUpdated) {
        onSpaceUpdated(data.space);
      }
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl w-full max-w-lg overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <span className="text-xl">{icon}</span>
            <div>
              <h2 className="text-base font-extrabold text-blue-950">Edit Space Appearance</h2>
              <p className="text-xs text-slate-500">Change space name, icon, and background photo</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-slate-800 text-xs">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Space Name */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Space Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Tech Squad or Paris Trip 2026"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 font-semibold"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this space for?"
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 font-medium"
            />
          </div>

          {/* Icon Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 block">Space Icon / Emoji</label>
            <div className="flex items-center gap-2 flex-wrap">
              {PRESET_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={`w-9 h-9 text-lg rounded-xl flex items-center justify-center transition border ${
                    icon === emoji
                      ? 'bg-blue-100 border-blue-900 scale-105 shadow-xs'
                      : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Background / Cover Photo */}
          <div className="space-y-2">
            <label className="font-bold text-slate-700 block">Background / Cover Photo</label>

            {/* Current Cover Preview */}
            <div className="h-28 rounded-2xl overflow-hidden border border-slate-200 relative bg-slate-100">
              {coverUrl ? (
                <img src={coverUrl} alt="Cover preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">
                  No Cover Selected
                </div>
              )}
              <div className="absolute inset-0 bg-black/20 flex items-end p-3">
                <span className="text-white font-extrabold text-sm drop-shadow-md flex items-center gap-2">
                  <span className="text-xl">{icon}</span>
                  <span>{name || 'Space Name'}</span>
                </span>
              </div>
            </div>

            {/* Custom URL or Preset Choice */}
            <div className="space-y-2 pt-1">
              <p className="text-[11px] font-bold text-slate-500">Pick a preset theme photo:</p>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_COVERS.map((url, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCoverUrl(url)}
                    className={`h-12 rounded-xl overflow-hidden border-2 transition ${
                      coverUrl === url ? 'border-blue-900 scale-105 shadow-xs' : 'border-transparent opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img src={url} alt={`Preset ${i}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="text"
                  value={coverUrl}
                  onChange={(e) => setCoverUrl(e.target.value)}
                  placeholder="Or paste image URL (Unsplash, Imgur, etc.)"
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-900 text-xs"
                />
                <label className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold border border-slate-200 cursor-pointer flex items-center gap-1 shrink-0">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold transition shadow-sm flex items-center gap-1.5"
            >
              {loading ? 'Saving...' : 'Save Appearance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
