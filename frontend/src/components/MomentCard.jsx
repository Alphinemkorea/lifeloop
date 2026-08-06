import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { ReactionsBar } from './ReactionsBar.jsx';
import { CommentSection } from './CommentSection.jsx';
import { MOODS } from '../types.js';
import { Trash2, Music, Image as ImageIcon, MessageCircle, Calendar, Sparkles, MapPin, Lock, Clock, Mic, Volume2, Hash } from 'lucide-react';

export const MomentCard = ({ moment, onDelete, onUpdated }) => {
  const { user, token } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const moodConfig = MOODS.find((m) => m.label.toLowerCase() === moment.mood?.toLowerCase()) || {
    label: moment.mood || 'Happy',
    emoji: '😊',
    color: 'bg-blue-100 text-blue-800 border-blue-200'
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this moment?')) return;
    if (!token) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/moments/${moment.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok && onDelete) {
        onDelete(moment.id);
      }
    } catch (err) {
      console.error('Error deleting moment:', err);
    } finally {
      setDeleting(false);
    }
  };

  const canDelete = user?.id === moment.user_id || user?.role === 'admin';

  return (
    <div className="glass-card rounded-3xl p-5 transition space-y-4 flex flex-col justify-between">
      <div className="space-y-3">
        {/* Header: Author & Meta */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={moment.user_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${moment.user_name}`}
              alt={moment.user_name}
              className="w-10 h-10 rounded-2xl object-cover bg-slate-100 border border-slate-200"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-blue-950 text-xs">{moment.user_name}</span>
                {moment.space_name && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200 text-[10px] font-bold">
                    {moment.space_name}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {moment.date || new Date(moment.created_at).toLocaleDateString()}
                </span>
                {moment.location && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-0.5 font-semibold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">
                      <MapPin className="w-3 h-3 text-rose-500" />
                      {moment.location}
                    </span>
                  </>
                )}
                <span>•</span>
                <span className="font-medium text-slate-500">{moment.category}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Time Capsule indicator or Mood badge */}
            {moment.is_locked ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-900 border border-purple-200 flex items-center gap-1 shadow-2xs">
                <Lock className="w-3 h-3 text-purple-700" />
                <span>Time Capsule</span>
              </span>
            ) : (
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${moodConfig.color}`}
              >
                <span>{moodConfig.emoji}</span>
                <span>{moodConfig.label}</span>
              </span>
            )}

            {canDelete && (
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition"
                title="Delete Moment"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Title & Description or Time Capsule Lock Card */}
        {moment.is_locked ? (
          <div className="p-4 bg-gradient-to-br from-purple-900 to-indigo-950 text-white rounded-2xl border border-purple-800 shadow-inner space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Lock className="w-24 h-24 text-white" />
            </div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-purple-300">
              <Clock className="w-4 h-4 text-purple-300 animate-pulse" />
              <span>Time Capsule Locked</span>
            </div>
            <div>
              <h3 className="font-black text-base text-white">{moment.title}</h3>
              <p className="text-xs text-purple-200/80 mt-1">
                This memory is sealed until <span className="font-bold text-amber-300">{moment.unlock_date || 'its unlock date'}</span> ({moment.days_until_unlock} days left).
              </p>
            </div>
            <div className="pt-2 flex items-center gap-2 text-[11px] font-mono bg-purple-950/60 p-2.5 rounded-xl border border-purple-800/80">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="text-purple-200">Shared in private space. Check back when unlocked!</span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{moment.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap">{moment.description}</p>
            
            {/* Tags */}
            {moment.tags && moment.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {moment.tags.map((t, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md border border-slate-200"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Voice Note Audio Player */}
        {!moment.is_locked && moment.audio_url && (
          <div className="p-3 bg-indigo-50/80 border border-indigo-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Mic className="w-4 h-4 animate-pulse" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-indigo-950 block truncate">Voice Note Memory</span>
                <span className="text-[10px] text-indigo-700/80 block">Recorded audio clip</span>
              </div>
            </div>

            <audio src={moment.audio_url} controls className="h-8 max-w-[180px] shrink-0" />
          </div>
        )}

        {/* Photo Gallery */}
        {moment.photos && moment.photos.length > 0 && (
          <div className={`grid gap-2 pt-1 ${moment.photos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {moment.photos.map((photo, i) => (
              <div key={photo.id || i} className="relative group rounded-2xl overflow-hidden bg-slate-100 max-h-64">
                <img
                  src={photo.url}
                  alt={photo.caption || 'Memory Photo'}
                  className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                />
              </div>
            ))}
          </div>
        )}

        {/* Music / Song Widget */}
        {moment.song && (
          <div className="flex items-center justify-between p-3 bg-amber-50/70 border border-amber-200/60 rounded-2xl text-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Music className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-amber-950 block truncate">{moment.song.title}</span>
                <span className="text-[10px] text-amber-800/80 block truncate">{moment.song.artist}</span>
              </div>
            </div>

            {moment.song.spotify_url && (
              <a
                href={moment.song.spotify_url}
                target="_blank"
                rel="noreferrer"
                className="text-[10px] font-bold text-amber-900 bg-amber-200/60 hover:bg-amber-200 px-2.5 py-1 rounded-xl transition shrink-0"
              >
                Listen
              </a>
            )}
          </div>
        )}
      </div>

      {/* Footer Actions: Reactions & Comments toggle */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between gap-2">
          <ReactionsBar
            momentId={moment.id}
            initialReactionsCount={moment.reactions_count}
            initialUserReaction={moment.user_reaction}
          />

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-900 transition px-2.5 py-1 rounded-xl hover:bg-slate-100"
          >
            <MessageCircle className="w-4 h-4 text-slate-400" />
            <span>{moment.comments_count || 0}</span>
          </button>
        </div>

        {/* Collapsible Comments Section */}
        {showComments && (
          <CommentSection
            momentId={moment.id}
            comments={moment.comments || []}
            onCommentAdded={onUpdated}
            onCommentDeleted={onUpdated}
          />
        )}
      </div>
    </div>
  );
};
