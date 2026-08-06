import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { User, AtSign, Calendar, Instagram, Camera, Sparkles, Check, Upload, Image } from 'lucide-react';

export const ProfileSetupModal = ({ isOpen, onClose }) => {
  const { user, profile, token, updateProfileState, refetchUser } = useAuth();
  const fileInputRef = useRef(null);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || '');
    }
    if (profile) {
      setUsername(profile.username || (user?.full_name ? `@${user.full_name.toLowerCase().replace(/\s+/g, '')}` : ''));
      setAge(profile.age || '');
      setInstagramHandle(profile.instagram_handle || '');
      setAvatarUrl(profile.avatar_url || '');
      setBio(profile.bio || '');
    }
  }, [user, profile]);

  if (!isOpen) return null;

  const presetAvatars = [
    `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.full_name || 'life'}`,
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80'
  ];

  const handleAvatarFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WEBP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (!result) return;

      const img = new window.Image();
      img.onload = () => {
        const maxDim = 800;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const resizedDataUrl = canvas.toDataURL(file.type || 'image/jpeg', 0.85);
        setAvatarUrl(resizedDataUrl);
      };
      img.onerror = () => {
        setAvatarUrl(result);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    setLoading(true);
    setSuccessMsg(null);

    try {
      const res = await fetch('/api/profiles', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: fullName,
          username: username.startsWith('@') ? username : `@${username}`,
          age,
          instagram_handle: instagramHandle,
          avatar_url: avatarUrl || presetAvatars[0],
          bio
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessMsg('Profile details updated successfully!');
        if (data.profile) {
          updateProfileState(data.profile);
        }
        await refetchUser();
        setTimeout(() => {
          setSuccessMsg(null);
          onClose();
        }, 1000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl space-y-5 text-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="text-center space-y-1">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-100 border border-blue-200 flex items-center justify-center text-blue-900">
            <Sparkles className="w-6 h-6 text-blue-900" />
          </div>
          <h2 className="text-xl font-black text-blue-950">Complete Your Profile Details</h2>
          <p className="text-xs text-slate-500">
            Set up your display name, username, age, profile pic, and Instagram account.
          </p>
        </div>

        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Profile Pic Picker with Local Storage Upload */}
          <div className="p-3.5 bg-blue-50/50 border border-blue-100 rounded-2xl space-y-3">
            <label className="block font-bold text-blue-950 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-blue-900" />
              <span>Profile Picture</span>
            </label>

            <div className="flex items-center gap-4">
              <div className="relative group shrink-0">
                <img
                  src={avatarUrl || presetAvatars[0]}
                  alt="Avatar Preview"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-900 shadow-md bg-white"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  title="Upload from device"
                >
                  <Camera className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleAvatarFileUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl transition shadow-sm text-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo from Local Storage</span>
                </button>

                <input
                  type="text"
                  placeholder="Or paste image URL (https://...)"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-900"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 border-t border-blue-100">
              <span className="text-[10px] text-slate-400 font-bold uppercase shrink-0">Presets:</span>
              {presetAvatars.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setAvatarUrl(url)}
                  className={`w-8 h-8 rounded-xl border-2 transition overflow-hidden shrink-0 ${
                    avatarUrl === url ? 'border-blue-900 scale-105 ring-2 ring-blue-900/20' : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <img src={url} alt="preset" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Full Name */}
            <div>
              <label className="block font-bold text-blue-950 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-900" />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                placeholder="Maya Lin"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label className="block font-bold text-blue-950 mb-1 flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5 text-blue-900" />
                <span>Username *</span>
              </label>
              <input
                type="text"
                placeholder="@mayalin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900 font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Age */}
            <div>
              <label className="block font-bold text-blue-950 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-900" />
                <span>Age</span>
              </label>
              <input
                type="number"
                placeholder="24"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900"
              />
            </div>

            {/* Instagram Handle */}
            <div>
              <label className="block font-bold text-blue-950 mb-1 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                <span>Instagram Account</span>
              </label>
              <input
                type="text"
                placeholder="@maya_moments"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <label className="block font-bold text-blue-950 mb-1">Short Bio</label>
            <textarea
              placeholder="Tell friends about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900 h-20 resize-none"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold shadow-md disabled:opacity-50 transition"
            >
              {loading ? 'Saving Profile...' : 'Save Profile Details'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
