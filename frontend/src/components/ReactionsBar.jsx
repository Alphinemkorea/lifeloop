import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';

export const ReactionsBar = ({ momentId, initialReactionsCount, initialUserReaction, onReactionUpdated }) => {
  const { token } = useAuth();
  const [reactionsCount, setReactionsCount] = useState(
    initialReactionsCount || { love: 0, funny: 0, awesome: 0, congrats: 0, wow: 0 }
  );
  const [userReaction, setUserReaction] = useState(initialUserReaction || null);
  const [loading, setLoading] = useState(false);

  const reactionOptions = [
    { type: 'love', emoji: '❤️', label: 'Love' },
    { type: 'funny', emoji: '😂', label: 'Funny' },
    { type: 'awesome', emoji: '🔥', label: 'Awesome' },
    { type: 'congrats', emoji: '🎉', label: 'Congrats' },
    { type: 'wow', emoji: '😮', label: 'Wow' }
  ];

  const handleToggle = async (type) => {
    if (!token || loading) return;

    setLoading(true);
    try {
      const res = await fetch('/api/reactions/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ moment_id: momentId, type })
      });

      if (res.ok) {
        const data = await res.json();
        setReactionsCount(data.reactions_count);
        setUserReaction(data.user_reaction);
        if (onReactionUpdated) onReactionUpdated(data);
      }
    } catch (err) {
      console.error('Error toggling reaction:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {reactionOptions.map((opt) => {
        const count = reactionsCount[opt.type] || 0;
        const isActive = userReaction === opt.type;

        return (
          <button
            key={opt.type}
            type="button"
            onClick={() => handleToggle(opt.type)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition ${
              isActive
                ? 'bg-blue-100 text-blue-900 border border-blue-300 ring-1 ring-blue-400'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
            }`}
          >
            <span>{opt.emoji}</span>
            {count > 0 && <span>{count}</span>}
          </button>
        );
      })}
    </div>
  );
};
