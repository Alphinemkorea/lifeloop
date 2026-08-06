import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { MOODS, CATEGORIES } from '../types.js';
import { X, Sparkles, Image, Music, Upload, Calendar, Tag, MapPin, Lock, Clock, Mic, Square, Play, Volume2, Trash2, Hash } from 'lucide-react';

export const MomentModal = ({ isOpen, onClose, onMomentCreated, spaces = [], defaultSpaceId }) => {
  const { token, user } = useAuth();
  const fileInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const [spaceId, setSpaceId] = useState(defaultSpaceId || (spaces[0]?.id || ''));
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [mood, setMood] = useState('Happy');
  const [category, setCategory] = useState('General');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  // Voice Note Recording
  const [isRecording, setIsRecording] = useState(false);
  const [audioBase64, setAudioBase64] = useState('');
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  // Tags
  const [tags, setTags] = useState(['Memory', 'Fun']);
  const [tagInput, setTagInput] = useState('');

  // Time Capsule
  const [isTimeCapsule, setIsTimeCapsule] = useState(false);
  const [unlockDate, setUnlockDate] = useState('');

  // Photos
  const [photoUrls, setPhotoUrls] = useState([]);
  const [inputPhotoUrl, setInputPhotoUrl] = useState('');

  // Song
  const [songTitle, setSongTitle] = useState('');
  const [songArtist, setSongArtist] = useState('');
  const [spotifyUrl, setSpotifyUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioBase64(reader.result);
        };
        reader.readAsDataURL(blob);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingSeconds(0);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      alert('Microphone access unavailable in this browser. You can also upload an audio file!');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
  };

  const handleAudioFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setAudioBase64(event.target?.result || '');
    };
    reader.readAsDataURL(file);
  };

  const handleAddTag = (tagText) => {
    const clean = (tagText || tagInput).trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (!result) return;

      // Compress photo using canvas
      const img = new window.Image();
      img.onload = () => {
        const maxDim = 1200;
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
        const compressedDataUrl = canvas.toDataURL(file.type || 'image/jpeg', 0.85);
        setPhotoUrls((prev) => [...prev, compressedDataUrl]);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleAddUrl = () => {
    if (inputPhotoUrl.trim()) {
      setPhotoUrls((prev) => [...prev, inputPhotoUrl.trim()]);
      setInputPhotoUrl('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) return;

    const targetSpaceId = spaceId || defaultSpaceId || spaces[0]?.id;
    if (!targetSpaceId) {
      setError('Please select or join a space first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        space_id: targetSpaceId,
        user_id: user.id,
        title,
        description,
        mood,
        category,
        location,
        unlock_date: isTimeCapsule && unlockDate ? unlockDate : null,
        audio_url: audioBase64 || null,
        tags: tags,
        date,
        photo_urls: photoUrls,
        song: songTitle ? { title: songTitle, artist: songArtist, spotify_url: spotifyUrl } : null
      };

      const res = await fetch('/api/moments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to create moment');
      }

      // Reset form
      setTitle('');
      setDescription('');
      setPhotoUrls([]);
      setAudioBase64('');
      setTags(['Memory', 'Fun']);
      setSongTitle('');
      setSongArtist('');
      setSpotifyUrl('');

      // Dispatch global event for instant reactivity across tree & feed components
      window.dispatchEvent(new CustomEvent('moment_created', { detail: data }));

      if (onMomentCreated) onMomentCreated(data.moment || data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 w-full max-w-xl shadow-2xl space-y-5 text-slate-800 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-900 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-900" />
            </div>
            <div>
              <h2 className="text-base font-black text-blue-950">Add a New Moment</h2>
              <p className="text-[11px] text-slate-500">Capture a photo, memory, or song in your space</p>
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
          {/* Select Space */}
          <div>
            <label className="block font-bold text-blue-950 mb-1">Target Space *</label>
            <select
              value={spaceId || defaultSpaceId || (spaces[0]?.id || '')}
              onChange={(e) => setSpaceId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-medium focus:outline-none focus:border-blue-900"
              required
            >
              {spaces.length === 0 && <option value="">No spaces available - Join or create one</option>}
              {spaces.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.icon} {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-blue-950 mb-1">Moment Title *</label>
              <input
                type="text"
                placeholder="e.g., Weekend Coffee Run & Laughter"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900 font-semibold"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-blue-950 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-blue-900" />
                <span>Date</span>
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900"
              />
            </div>
          </div>

          {/* Category, Mood & Location */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-blue-950 mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-blue-900" />
                <span>Category</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-blue-950 mb-1">Mood</label>
              <select
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900"
              >
                {MOODS.map((m) => (
                  <option key={m.label} value={m.label}>
                    {m.emoji} {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-blue-950 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-600" />
                <span>Location Tag</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Paris, France"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900 font-medium"
              />
            </div>
          </div>

          {/* Time Capsule Lock Option */}
          <div className="p-3 bg-purple-50/70 border border-purple-200/70 rounded-2xl space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-purple-950 flex items-center gap-1.5 cursor-pointer">
                <Lock className="w-4 h-4 text-purple-700" />
                <span>Lock as Future Time Capsule?</span>
              </label>
              <input
                type="checkbox"
                checked={isTimeCapsule}
                onChange={(e) => setIsTimeCapsule(e.target.checked)}
                className="w-4 h-4 accent-purple-700 rounded cursor-pointer"
              />
            </div>

            {isTimeCapsule && (
              <div className="pt-2 border-t border-purple-100 flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <div className="flex items-center gap-1.5 text-purple-900 font-semibold shrink-0">
                  <Clock className="w-3.5 h-3.5 text-purple-600" />
                  <span>Unlock Date:</span>
                </div>
                <input
                  type="date"
                  min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                  value={unlockDate}
                  onChange={(e) => setUnlockDate(e.target.value)}
                  className="bg-white border border-purple-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-purple-600 w-full sm:w-auto"
                  required={isTimeCapsule}
                />
                <span className="text-[10px] text-purple-700 italic">
                  Photos & details remain locked until this date!
                </span>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-blue-950 mb-1">Description / Scrapbook Note *</label>
            <textarea
              placeholder="What made this moment special? Share the story..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900 h-24 resize-none"
              required
            />
          </div>

          {/* Tags */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <label className="block font-bold text-blue-950 flex items-center gap-1.5">
              <Hash className="w-4 h-4 text-blue-800" />
              <span>Tags / Memory Keywords</span>
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type tag (e.g. vacation, study, coffee) & hit Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTag();
                  }
                }}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-800"
              />
              <button
                type="button"
                onClick={() => handleAddTag()}
                className="px-3 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold rounded-xl transition text-xs"
              >
                + Add Tag
              </button>
            </div>
            {/* Tag Badges */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {tags.map((t) => (
                <span
                  key={t}
                  className="px-2.5 py-1 bg-white border border-slate-300 text-slate-700 text-[11px] font-bold rounded-full inline-flex items-center gap-1.5 shadow-2xs"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-rose-600 text-slate-400 font-bold"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Audio Voice Note */}
          <div className="p-3 bg-indigo-50/70 border border-indigo-200/70 rounded-2xl space-y-2">
            <label className="block font-bold text-indigo-950 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-indigo-700" />
                <span>Audio Voice Note</span>
              </div>
              <span className="text-[10px] text-indigo-600 font-normal">Record a 15-sec voice memory</span>
            </label>

            <div className="flex items-center gap-2">
              {!isRecording ? (
                <button
                  type="button"
                  onClick={startRecording}
                  className="px-3 py-2 bg-indigo-700 hover:bg-indigo-800 text-white font-bold rounded-xl transition flex items-center gap-1.5 text-xs shrink-0 shadow-sm"
                >
                  <Mic className="w-3.5 h-3.5" />
                  <span>Record Voice</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={stopRecording}
                  className="px-3 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl transition flex items-center gap-1.5 text-xs shrink-0 animate-pulse"
                >
                  <Square className="w-3.5 h-3.5 fill-white" />
                  <span>Stop ({recordingSeconds}s)</span>
                </button>
              )}

              <input
                type="file"
                ref={audioInputRef}
                accept="audio/*"
                onChange={handleAudioFileUpload}
                className="hidden"
              />

              <button
                type="button"
                onClick={() => audioInputRef.current?.click()}
                className="px-3 py-2 bg-white border border-indigo-200 hover:bg-indigo-100 text-indigo-900 font-bold rounded-xl transition text-xs shrink-0"
              >
                Upload Audio File
              </button>
            </div>

            {audioBase64 && (
              <div className="p-2 bg-white rounded-xl border border-indigo-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-indigo-600 animate-pulse" />
                  <span className="text-xs font-bold text-indigo-950">Voice Note Attached!</span>
                </div>
                <div className="flex items-center gap-2">
                  <audio src={audioBase64} controls className="h-7 max-w-[200px]" />
                  <button
                    type="button"
                    onClick={() => setAudioBase64('')}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Photo Attachments */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <label className="block font-bold text-blue-950 flex items-center gap-1.5">
              <Image className="w-4 h-4 text-blue-900" />
              <span>Attach Photos</span>
            </label>

            <div className="flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-2 bg-blue-900 hover:bg-blue-800 text-white font-bold rounded-xl transition flex items-center gap-1.5 text-xs shrink-0"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload File</span>
              </button>

              <input
                type="text"
                placeholder="Or paste photo URL..."
                value={inputPhotoUrl}
                onChange={(e) => setInputPhotoUrl(e.target.value)}
                className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-blue-900"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 font-bold rounded-xl transition"
              >
                Add
              </button>
            </div>

            {/* Photo Previews */}
            {photoUrls.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pt-2">
                {photoUrls.map((url, idx) => (
                  <div key={idx} className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-300 shrink-0">
                    <img src={url} alt="Upload preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setPhotoUrls((prev) => prev.filter((_, i) => i !== idx))}
                      className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-black/70 text-white flex items-center justify-center text-[10px]"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Music / Song Attachment */}
          <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-2xl space-y-2">
            <label className="block font-bold text-amber-950 flex items-center gap-1.5">
              <Music className="w-4 h-4 text-amber-600" />
              <span>Soundtrack of this Moment (Optional)</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                placeholder="Song Title (e.g. As It Was)"
                value={songTitle}
                onChange={(e) => setSongTitle(e.target.value)}
                className="bg-white border border-amber-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
              <input
                type="text"
                placeholder="Artist (e.g. Harry Styles)"
                value={songArtist}
                onChange={(e) => setSongArtist(e.target.value)}
                className="bg-white border border-amber-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold shadow-md disabled:opacity-50 transition"
            >
              {loading ? 'Posting Moment...' : 'Publish Moment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
