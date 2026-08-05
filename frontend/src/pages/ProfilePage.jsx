import React, { useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useFetch } from '../hooks/useFetch.js';
import { MomentCard } from '../components/MomentCard.jsx';
import { ProfileSetupModal } from '../components/ProfileSetupModal.jsx';
import { Edit2, Quote, MapPin, Calendar, Sparkles, Upload, AtSign, Instagram, UserCheck, Camera } from 'lucide-react';

export const ProfilePage = () => {
  const { userId } = useParams();
  const { user: currentUser, profile: currentProfile, token, refetchUser, updateProfileState } = useAuth();
  const avatarInputRef = useRef(null);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const targetUserId = userId || currentUser?.id || '';
  const isSelf = currentUser?.id === targetUserId;

  // Fetch Profile Data
  const { data: profileRes, loading, refetch: refetchProfile } = useFetch(
    targetUserId ? `/api/profiles/${targetUserId}` : ''
  );

  // Fetch User's Moments
  const { data: momentsRes, refetch: refetchMoments } = useFetch(
    targetUserId ? `/api/moments?user_id=${targetUserId}` : ''
  );

  const profile = isSelf ? currentProfile : profileRes?.profile;
  const user = isSelf ? currentUser : profileRes?.user;

  const [showSetupModal, setShowSetupModal] = useState(false);

  const handleQuickAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file || !token) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setUploadingAvatar(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (!result) {
        setUploadingAvatar(false);
        return;
      }

      const img = new window.Image();
      img.onload = async () => {
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
        const dataUrl = canvas.toDataURL(file.type || 'image/jpeg', 0.85);

        try {
          const res = await fetch('/api/profiles', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              avatar_url: dataUrl
            })
          });

          const data = await res.json();
          if (res.ok && data.profile) {
            updateProfileState(data.profile);
            await refetchUser();
            refetchProfile();
          }
        } catch (err) {
          console.error(err);
        } finally {
          setUploadingAvatar(false);
        }
      };
      img.onerror = () => {
        setUploadingAvatar(false);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-3xl max-w-xl mx-auto">
        Loading user profile...
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 text-slate-800">
      <ProfileSetupModal
        isOpen={showSetupModal}
        onClose={() => {
          setShowSetupModal(false);
          refetchProfile();
        }}
      />

      {/* Hidden File Input for Avatar */}
      {isSelf && (
        <input
          type="file"
          ref={avatarInputRef}
          accept="image/*"
          onChange={handleQuickAvatarUpload}
          className="hidden"
        />
      )}

      {/* Profile Card */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="relative group shrink-0">
              <img
                src={profile?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.full_name}`}
                alt={user?.full_name}
                className="w-20 h-20 rounded-2xl object-cover bg-slate-100 border-2 border-blue-900 shadow-md"
              />
              {isSelf && (
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute inset-0 bg-black/50 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer"
                  title="Upload photo from device"
                >
                  <Camera className="w-5 h-5 mb-0.5" />
                  <span className="text-[9px] font-bold">Change</span>
                </button>
              )}
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-blue-950">{user?.full_name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-900 text-xs font-bold border border-blue-200">
                    Profile
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span className="font-mono text-blue-900 font-bold flex items-center gap-1">
                    <AtSign className="w-3.5 h-3.5" />
                    {profile?.username || `@${user?.full_name.toLowerCase().replace(/\s+/g, '')}`}
                  </span>
                  <span>•</span>
                  <span>{user?.email}</span>
                  {profile?.age && (
                    <>
                      <span>•</span>
                      <span className="bg-slate-100 px-2 py-0.5 rounded-md text-slate-700 font-medium">
                        Age: {profile.age}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {profile?.instagram_handle && (
                <a
                  href={`https://instagram.com/${profile.instagram_handle.replace('@', '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-pink-600 hover:text-pink-700 hover:underline bg-pink-50 px-2.5 py-1 rounded-xl border border-pink-100"
                >
                  <Instagram className="w-3.5 h-3.5" />
                  <span>{profile.instagram_handle.startsWith('@') ? profile.instagram_handle : `@${profile.instagram_handle}`}</span>
                </a>
              )}

              {profile?.bio && (
                <p className="text-xs text-slate-700 leading-relaxed pt-1 max-w-md">
                  {profile.bio}
                </p>
              )}

              {profile?.favorite_quote && (
                <p className="text-xs italic text-blue-900 flex items-center gap-1.5 pt-1">
                  <Quote className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                  <span>"{profile.favorite_quote}"</span>
                </p>
              )}

              <div className="flex items-center gap-4 text-xs text-slate-500 pt-1">
                {profile?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    {profile.location}
                  </span>
                )}
                {profile?.birthday && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    Born {profile.birthday}
                  </span>
                )}
              </div>
            </div>
          </div>

          {isSelf && (
            <button
              onClick={() => setShowSetupModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-semibold shadow-sm transition shrink-0"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Edit Profile Details</span>
            </button>
          )}
        </div>
      </div>

      {/* User's Posted Moments Feed */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-blue-950 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <span>Moments Shared by {user?.full_name}</span>
        </h2>

        {(!momentsRes?.data || momentsRes.data.length === 0) ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-2xl">
            No moments posted yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {(momentsRes?.data || []).map((m) => (
              <MomentCard key={m.id} moment={m} onDelete={() => refetchMoments()} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
