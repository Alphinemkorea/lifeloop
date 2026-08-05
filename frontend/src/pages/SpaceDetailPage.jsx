import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useFetch } from '../hooks/useFetch.js';
import { copyToClipboard } from '../utils/api.js';
import { MomentCard } from '../components/MomentCard.jsx';
import { WeeklyTreeCanvas } from '../components/WeeklyTreeCanvas.jsx';
import { AIReflectionModal } from '../components/AIReflectionModal.jsx';
import { EditSpaceModal } from '../components/EditSpaceModal.jsx';
import {
  PlusCircle,
  Users,
  Hash,
  LogOut,
  Sparkles,
  TreePine,
  Edit3,
  Crown,
  UserX,
  Copy,
  Check,
  Share2
} from 'lucide-react';

export const SpaceDetailPage = ({ onOpenNewMomentModalWithSpace }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'tree' | 'members'
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedShare, setCopiedShare] = useState(false);
  const [isAIReflectionOpen, setIsAIReflectionOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [memberActionLoading, setMemberActionLoading] = useState(null);

  // Fetch Space Detail
  const { data: spaceRes, loading: loadingSpace, refetch: refetchSpace } = useFetch(
    id && user ? `/api/spaces/${id}?user_id=${user.id}` : ''
  );

  // Fetch Space Moments
  const { data: momentsRes, refetch: refetchMoments } = useFetch(
    id ? `/api/moments?space_id=${id}` : ''
  );

  // Fetch Weekly Tree
  const { data: treeRes } = useFetch(id ? `/api/spaces/${id}/weekly-tree` : '');

  const space = spaceRes?.space || spaceRes;
  const moments = momentsRes?.data || [];
  const isOwner = space?.is_owner || space?.user_role === 'owner';

  const handleCopyCode = async () => {
    if (space?.invite_code) {
      const ok = await copyToClipboard(space.invite_code);
      if (ok) {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
    }
  };

  const handleShareSpace = async () => {
    if (space) {
      const shareMsg = `Join my space "${space.name}" on LifeLoop using code: ${space.invite_code}`;
      const ok = await copyToClipboard(shareMsg);
      if (ok) {
        setCopiedShare(true);
        setTimeout(() => setCopiedShare(false), 2500);
      }
    }
  };

  const handleLeaveSpace = async () => {
    if (!window.confirm(`Leave space "${space?.name}"?`)) return;
    if (!token) return;

    try {
      const res = await fetch(`/api/spaces/${id}/leave`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        navigate('/spaces');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveMember = async (targetUserId, memberName) => {
    if (!window.confirm(`Are you sure you want to remove "${memberName}" from this space?`)) return;
    setMemberActionLoading(targetUserId);

    try {
      const res = await fetch(`/api/spaces/${id}/members/${targetUserId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Failed to remove member.');
      } else {
        refetchSpace();
      }
    } catch (err) {
      console.error(err);
      alert('Network error removing member.');
    } finally {
      setMemberActionLoading(null);
    }
  };

  if (loadingSpace) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-3xl max-w-xl mx-auto">
        Loading space details...
      </div>
    );
  }

  if (!space) {
    return (
      <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-3xl max-w-xl mx-auto space-y-3">
        <p className="font-bold text-slate-800 text-sm">Space not found or access restricted.</p>
        <Link to="/spaces" className="inline-block px-4 py-2 bg-blue-900 text-white rounded-xl font-bold text-xs">
          Back to All Spaces
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12 text-slate-800">
      {/* Cover Header */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs relative">
        <div className="h-40 md:h-52 bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 relative">
          {space.cover_url && (
            <img src={space.cover_url} alt={space.name} className="w-full h-full object-cover opacity-60" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        </div>

        <div className="p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 -mt-14 relative z-10">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-3xl bg-white border-4 border-white shadow-xl flex items-center justify-center text-4xl shrink-0">
              {space.icon || '🌿'}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl md:text-2xl font-black text-blue-950">{space.name}</h1>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-black flex items-center gap-1 border ${
                    isOwner
                      ? 'bg-amber-400 text-amber-950 border-amber-300'
                      : 'bg-blue-50 text-blue-900 border-blue-200'
                  }`}
                >
                  {isOwner ? (
                    <>
                      <Crown className="w-3 h-3 fill-amber-950 text-amber-950" />
                      <span>Space Owner</span>
                    </>
                  ) : (
                    <span>Member</span>
                  )}
                </span>
              </div>
              <p className="text-xs text-slate-600 max-w-xl leading-relaxed">{space.description || 'Private Memory Scrapbook'}</p>

              <div className="flex items-center gap-3 text-xs pt-1 flex-wrap">
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 font-mono text-blue-900 font-bold bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-xl border border-blue-200 transition"
                  title="Click to copy invite code"
                >
                  <Hash className="w-3.5 h-3.5" />
                  <span>Code: {space.invite_code}</span>
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                </button>

                <span className="text-slate-400">•</span>
                <span className="text-slate-500 font-semibold">{space.member_count} Members</span>
                <span className="text-slate-400">•</span>
                <span className="text-slate-500 font-semibold">{space.moments_count} Moments</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end md:self-center flex-wrap">
            {space.is_member && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition"
                title="Edit space appearance (Name, Cover photo, Icon)"
              >
                <Edit3 className="w-4 h-4 text-blue-900" />
                <span>Edit Appearance</span>
              </button>
            )}

            <button
              onClick={() => setIsAIReflectionOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm transition"
            >
              <Sparkles className="w-4 h-4 text-blue-200 animate-pulse" />
              <span>AI Reflection ✦</span>
            </button>

            <button
              onClick={handleShareSpace}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition"
              title="Copy share message with code"
            >
              {copiedShare ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-slate-600" />}
              <span>{copiedShare ? 'Copied Share Text!' : 'Share Code'}</span>
            </button>

            <button
              onClick={() => onOpenNewMomentModalWithSpace(space.id)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold shadow-sm transition"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post Moment</span>
            </button>

            {space.is_member && !isOwner && (
              <button
                onClick={handleLeaveSpace}
                className="p-2.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition"
                title="Leave Space"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="px-6 border-t border-slate-100 flex items-center gap-6 text-xs font-bold text-slate-500">
          <button
            onClick={() => setActiveTab('feed')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'feed' ? 'border-blue-900 text-blue-900' : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Moments Feed ({moments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tree')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'tree' ? 'border-emerald-600 text-emerald-900' : 'border-transparent hover:text-slate-800'
            }`}
          >
            <TreePine className="w-4 h-4 text-emerald-600" />
            <span>Memory Tree</span>
          </button>

          <button
            onClick={() => setActiveTab('members')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition ${
              activeTab === 'members' ? 'border-blue-900 text-blue-900' : 'border-transparent hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4 text-blue-900" />
            <span>Space Members ({space.members?.length || space.member_count})</span>
          </button>
        </div>
      </div>

      {/* Content depending on Active Tab */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          {moments.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500 bg-white border border-slate-200 rounded-3xl space-y-2">
              <p className="font-bold text-slate-700">No moments in {space.name} yet.</p>
              <p>Be the first member to share a photo or memory!</p>
              <button
                onClick={() => onOpenNewMomentModalWithSpace(space.id)}
                className="mt-2 px-4 py-2 bg-blue-900 text-white rounded-xl font-bold text-xs"
              >
                Post First Moment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {moments.map((m) => (
                <MomentCard key={m.id} moment={m} onDelete={() => refetchMoments()} onUpdated={() => refetchMoments()} />
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'tree' && <WeeklyTreeCanvas treeData={treeRes} />}

      {activeTab === 'members' && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-blue-950 flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-900" />
                <span>Space Members ({space.members?.length || 0})</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {isOwner
                  ? 'As space owner, you can manage and remove members.'
                  : 'All members can edit space appearance (name, icon, background).'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {space.members?.map((member) => {
              const memberIsOwner = member.role === 'owner' || space.created_by === member.user_id;
              const isCurrentUser = member.user_id === user?.id;

              return (
                <div key={member.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={member.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${member.user_name}`}
                      alt={member.user_name}
                      className="w-10 h-10 rounded-xl object-cover bg-white border border-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-xs text-blue-950 truncate">
                          {member.nickname_in_space || member.user_name}
                        </span>
                        {memberIsOwner ? (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-400 text-amber-950 flex items-center gap-0.5">
                            <Crown className="w-2.5 h-2.5 fill-amber-950 text-amber-950" />
                            <span>Owner</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
                            Member
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">{member.user_email}</span>
                    </div>
                  </div>

                  {/* Member Removal Button (Owner Only) */}
                  {isOwner && !memberIsOwner && !isCurrentUser && (
                    <button
                      onClick={() => handleRemoveMember(member.user_id, member.user_name)}
                      disabled={memberActionLoading === member.user_id}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-200 shrink-0"
                      title="Remove member from space"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AIReflectionModal
        isOpen={isAIReflectionOpen}
        onClose={() => setIsAIReflectionOpen(false)}
        spaceId={space.id}
        spaceName={space.name}
      />

      <EditSpaceModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        space={space}
        onSpaceUpdated={() => {
          refetchSpace();
          setIsEditModalOpen(false);
        }}
      />
    </div>
  );
};
