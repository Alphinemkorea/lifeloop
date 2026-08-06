import React, { useState, useRef } from 'react';
import { Mic, Square, Play, Pause, Trash2, Upload, Volume2 } from 'lucide-react';

export const AudioRecorder = ({ audioUrl, onAudioChange }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [recordTime, setRecordTime] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioElemRef = useRef(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          onAudioChange(reader.result);
        };
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordTime(0);

      timerRef.current = setInterval(() => {
        setRecordTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Microphone access error:", err);
      alert("Microphone permission required to record audio notes.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onAudioChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const togglePlayAudio = () => {
    if (!audioElemRef.current) return;
    if (isPlaying) {
      audioElemRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElemRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
        <Mic className="w-3.5 h-3.5 text-rose-500" />
        <span>Voice Note & Audio Attachment</span>
      </label>

      {audioUrl ? (
        <div className="glass-card p-3 rounded-2xl border flex items-center justify-between gap-3">
          <audio
            ref={audioElemRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={togglePlayAudio}
              className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center font-bold shadow-xs transition hover:scale-105"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            <div>
              <span className="text-xs font-black text-blue-950 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-rose-500 animate-pulse" />
                Audio Note Attached
              </span>
              <p className="text-[11px] text-slate-500">Ready to listen or save with memory</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onAudioChange('')}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 transition"
            title="Remove voice note"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {isRecording ? (
            <button
              type="button"
              onClick={stopRecording}
              className="px-4 py-2 rounded-xl bg-rose-600 text-white font-extrabold text-xs flex items-center gap-2 animate-pulse shadow-md"
            >
              <Square className="w-4 h-4 fill-current" />
              <span>Stop Recording ({recordTime}s)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={startRecording}
              className="px-4 py-2 rounded-xl glass-card text-rose-600 hover:bg-rose-50 border-rose-200 font-extrabold text-xs flex items-center gap-2 transition"
            >
              <Mic className="w-4 h-4" />
              <span>Record Voice Note</span>
            </button>
          )}

          <label className="px-4 py-2 rounded-xl glass-card text-slate-600 hover:bg-slate-100 font-extrabold text-xs flex items-center gap-2 cursor-pointer transition">
            <Upload className="w-4 h-4" />
            <span>Upload Audio File</span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
};
