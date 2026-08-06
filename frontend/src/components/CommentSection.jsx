import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import { Send, Trash2, MessageCircle } from 'lucide-react';

export const CommentSection = ({ momentId, comments = [], onCommentAdded, onCommentDeleted }) => {
  const { user, token } = useAuth();
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || !token || submitting) return;

    setSubmitting(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ moment_id: momentId, content: content.trim() })
      });

      if (res.ok) {
        setContent('');
        if (onCommentAdded) onCommentAdded();
      }
    } catch (err) {
      console.error('Error posting comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (res.ok && onCommentDeleted) {
        onCommentDeleted();
      }
    } catch (err) {
      console.error('Error deleting comment:', err);
    }
  };

  return (
    <div className="space-y-3 pt-3 border-t border-slate-100">
      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
        <MessageCircle className="w-3.5 h-3.5 text-blue-900" />
        <span>Comments ({comments.length})</span>
      </div>

      {/* List of comments */}
      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {comments.length === 0 ? (
          <p className="text-[11px] text-slate-400 italic">No comments yet. Be the first to reply!</p>
        ) : (
          comments.map((c) => (
            <div key={c.id} className="flex items-start justify-between gap-2 bg-slate-50 p-2.5 rounded-xl text-xs">
              <div className="flex items-start gap-2 min-w-0">
                <img
                  src={c.user_avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${c.user_name}`}
                  alt={c.user_name}
                  className="w-6 h-6 rounded-lg object-cover shrink-0 bg-white border border-slate-200"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-950 text-[11px] truncate">{c.user_name}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(c.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-slate-700 text-xs mt-0.5 whitespace-pre-wrap">{c.content}</p>
                </div>
              </div>

              {(user?.id === c.user_id || user?.role === 'admin') && (
                <button
                  type="button"
                  onClick={() => handleDelete(c.id)}
                  className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50 transition shrink-0"
                  title="Delete Comment"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Post comment form */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2 pt-1">
        <input
          type="text"
          placeholder="Write a comment..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-blue-900 focus:bg-white"
        />
        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="p-2 bg-blue-900 hover:bg-blue-800 disabled:opacity-40 text-white rounded-xl transition"
          title="Send Comment"
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
};
