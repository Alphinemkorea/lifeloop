import React, { useEffect, useState } from 'react';
import { Megaphone, X, Sparkles, AlertCircle, CheckCircle2, AlertTriangle } from 'lucide-react';

export const SiteAnnouncementBanner = () => {
  const [settings, setSettings] = useState(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    fetch('/api/admin/site-settings')
      .then((res) => res.json())
      .then((data) => {
        if (data.settings && data.settings.announcement_enabled && data.settings.announcement_text) {
          setSettings(data.settings);
        }
      })
      .catch(() => {});
  }, []);

  if (!settings || !settings.announcement_enabled || !settings.announcement_text || dismissed) {
    return null;
  }

  const getTypeStyle = () => {
    switch (settings.announcement_type) {
      case 'success':
        return 'bg-emerald-600 text-white border-emerald-700';
      case 'warning':
        return 'bg-amber-500 text-amber-950 border-amber-600';
      case 'emergency':
        return 'bg-rose-600 text-white border-rose-700';
      case 'info':
      default:
        return 'bg-blue-900 text-white border-blue-950';
    }
  };

  return (
    <div className={`w-full py-2.5 px-4 text-xs font-bold border-b shadow-xs transition ${getTypeStyle()} flex items-center justify-between gap-3`}>
      <div className="flex items-center gap-2 max-w-6xl mx-auto w-full justify-center text-center">
        <Megaphone className="w-4 h-4 shrink-0 animate-bounce" />
        <span className="tracking-wide">{settings.announcement_text}</span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded-lg hover:bg-black/10 transition shrink-0"
        title="Dismiss announcement"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
