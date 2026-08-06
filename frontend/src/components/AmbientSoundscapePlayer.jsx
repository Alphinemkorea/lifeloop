import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, Music, Sparkles } from 'lucide-react';

const SOUNDSCAPES = [
  { id: 'rain', name: 'Gentle Rain', icon: '🌧️', type: 'noise', filterFreq: 1000 },
  { id: 'fireplace', name: 'Cozy Fireplace', icon: '🪵', type: 'crackle', filterFreq: 800 },
  { id: 'lofi', name: 'Soft Lo-Fi Chords', icon: '🎧', type: 'synth', filterFreq: 400 },
  { id: 'ocean', name: 'Ocean Waves', icon: '🌊', type: 'wave', filterFreq: 500 },
  { id: 'forest', name: 'Forest Birds', icon: '🌲', type: 'birds', filterFreq: 1500 }
];

export const AmbientSoundscapePlayer = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeSound, setActiveSound] = useState(SOUNDSCAPES[0]);
  const [volume, setVolume] = useState(0.4);
  const [isOpen, setIsOpen] = useState(false);

  const audioCtxRef = useRef(null);
  const gainNodeRef = useRef(null);
  const timerRef = useRef(null);

  const initAudio = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
        gainNodeRef.current = audioCtxRef.current.createGain();
        gainNodeRef.current.gain.value = volume;
        gainNodeRef.current.connect(audioCtxRef.current.destination);
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const stopCurrentSound = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const playSoundEffect = (sound) => {
    initAudio();
    stopCurrentSound();
    if (!audioCtxRef.current || !gainNodeRef.current) return;

    const ctx = audioCtxRef.current;
    const masterGain = gainNodeRef.current;

    if (sound.id === 'rain' || sound.id === 'ocean') {
      // Pink/Brown noise generator
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = sound.id === 'ocean' ? 'lowpass' : 'bandpass';
      filter.frequency.value = sound.filterFreq;

      whiteNoise.connect(filter);
      filter.connect(masterGain);
      whiteNoise.start();

      if (sound.id === 'ocean') {
        // LFO modulating filter for wave swelling effect
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.12; // wave speed
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 350;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start();
      }
    } else if (sound.id === 'lofi') {
      // Soft ambient chord synthesizer generator (Cmaj7 / Am9 soothing loop)
      const frequencies = [261.63, 329.63, 392.00, 493.88]; // C, E, G, B
      timerRef.current = setInterval(() => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') return;
        const noteFreq = frequencies[Math.floor(Math.random() * frequencies.length)];
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(noteFreq, ctx.currentTime);

        noteGain.gain.setValueAtTime(0, ctx.currentTime);
        noteGain.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.8);
        noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.5);

        osc.connect(noteGain);
        noteGain.connect(masterGain);
        osc.start();
        osc.stop(ctx.currentTime + 3.6);
      }, 1800);
    } else if (sound.id === 'fireplace') {
      // Fire crackle generator
      timerRef.current = setInterval(() => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') return;
        const pop = ctx.createOscillator();
        const popGain = ctx.createGain();
        pop.type = 'triangle';
        pop.frequency.setValueAtTime(Math.random() * 400 + 100, ctx.currentTime);
        popGain.gain.setValueAtTime(Math.random() * 0.15, ctx.currentTime);
        popGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

        pop.connect(popGain);
        popGain.connect(masterGain);
        pop.start();
        pop.stop(ctx.currentTime + 0.09);
      }, 120);
    } else if (sound.id === 'forest') {
      // Gentle bird chirps
      timerRef.current = setInterval(() => {
        if (!audioCtxRef.current || audioCtxRef.current.state === 'suspended') return;
        if (Math.random() > 0.4) {
          const chirp = ctx.createOscillator();
          const chirpGain = ctx.createGain();
          chirp.type = 'sine';
          const baseFreq = Math.random() * 800 + 2200;
          chirp.frequency.setValueAtTime(baseFreq, ctx.currentTime);
          chirp.frequency.exponentialRampToValueAtTime(baseFreq + 600, ctx.currentTime + 0.12);

          chirpGain.gain.setValueAtTime(0.05, ctx.currentTime);
          chirpGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

          chirp.connect(chirpGain);
          chirpGain.connect(masterGain);
          chirp.start();
          chirp.stop(ctx.currentTime + 0.16);
        }
      }, 1500);
    }
  };

  const handleTogglePlay = () => {
    if (isPlaying) {
      stopCurrentSound();
      if (audioCtxRef.current) {
        audioCtxRef.current.suspend();
      }
      setIsPlaying(false);
    } else {
      playSoundEffect(activeSound);
      setIsPlaying(true);
    }
  };

  const handleSelectSound = (sound) => {
    setActiveSound(sound);
    if (isPlaying) {
      playSoundEffect(sound);
    }
  };

  const handleVolumeChange = (e) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = val;
    }
  };

  return (
    <div className="relative z-30">
      {/* Soundscape Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-bold transition ${
          isPlaying
            ? 'bg-amber-400 text-amber-950 border border-amber-300 shadow-sm animate-pulse'
            : 'glass-card text-slate-700 hover:text-blue-950'
        }`}
        title="Cozy Ambient Soundscapes"
      >
        <span className="text-sm">{activeSound.icon}</span>
        <span className="hidden sm:inline truncate max-w-[100px]">{activeSound.name}</span>
        {isPlaying ? <Volume2 className="w-3.5 h-3.5 text-amber-950" /> : <VolumeX className="w-3.5 h-3.5 text-slate-400" />}
      </button>

      {/* Soundscape Control Popover */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-72 glass-panel rounded-2xl p-4 shadow-2xl border z-50 animate-fade-in space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs font-black text-blue-950 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Cozy Ambient Audio
              </span>
              <button
                onClick={handleTogglePlay}
                className={`p-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition ${
                  isPlaying ? 'bg-rose-500 text-white' : 'bg-blue-900 text-white'
                }`}
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
            </div>

            {/* Sound Selector Grid */}
            <div className="grid grid-cols-1 gap-1.5">
              {SOUNDSCAPES.map((snd) => {
                const isSelected = activeSound.id === snd.id;
                return (
                  <button
                    key={snd.id}
                    onClick={() => handleSelectSound(snd)}
                    className={`flex items-center gap-2.5 p-2 rounded-xl text-xs text-left transition ${
                      isSelected
                        ? 'bg-amber-400/20 border border-amber-400/40 text-amber-950 font-black'
                        : 'hover:bg-white/10 text-slate-700'
                    }`}
                  >
                    <span className="text-base">{snd.icon}</span>
                    <span className="flex-1 font-extrabold">{snd.name}</span>
                    {isSelected && isPlaying && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Volume Control */}
            <div className="pt-2 border-t border-white/10 space-y-1">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
                <span>Volume</span>
                <span>{Math.round(volume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={handleVolumeChange}
                className="w-full accent-blue-900 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};
