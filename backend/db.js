import fs from 'fs';
import path from 'path';
import {
  initialUsers,
  initialProfiles,
  initialSpaces,
  initialMemberships,
  initialMoments,
  initialPhotos,
  initialSongs,
  initialComments,
  initialReactions,
  initialWeeklySummaries
} from './seedData.js';

const IS_VERCEL = Boolean(process.env.VERCEL || process.env.NOW_BUILDER);
const DATA_FILE = IS_VERCEL
  ? path.join('/tmp', 'data.json')
  : path.join(process.cwd(), 'backend', 'data.json');

let db = {
  users: [...initialUsers],
  profiles: [...initialProfiles],
  spaces: [...initialSpaces],
  memberships: [...initialMemberships],
  moments: [...initialMoments],
  photos: [...initialPhotos],
  songs: [...initialSongs],
  comments: [...initialComments],
  reactions: [...initialReactions],
  weeklySummaries: [...initialWeeklySummaries]
};

// Try loading persisted data if available
try {
  let raw = null;
  if (fs.existsSync(DATA_FILE)) {
    raw = fs.readFileSync(DATA_FILE, 'utf-8');
  } else if (IS_VERCEL) {
    const repoDataFile = path.join(process.cwd(), 'backend', 'data.json');
    if (fs.existsSync(repoDataFile)) {
      raw = fs.readFileSync(repoDataFile, 'utf-8');
    }
  }

  if (raw) {
    const parsed = JSON.parse(raw);
    if (parsed.users && Array.isArray(parsed.users) && parsed.spaces) {
      db = parsed;
    }
  }
} catch (e) {
  console.log('Using initial seed database');
}

export function saveDb() {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to save db:', err);
  }
}

export function resetDatabaseToSeed() {
  db = {
    users: JSON.parse(JSON.stringify(initialUsers)),
    profiles: JSON.parse(JSON.stringify(initialProfiles)),
    spaces: JSON.parse(JSON.stringify(initialSpaces)),
    memberships: JSON.parse(JSON.stringify(initialMemberships)),
    moments: JSON.parse(JSON.stringify(initialMoments)),
    photos: JSON.parse(JSON.stringify(initialPhotos)),
    songs: JSON.parse(JSON.stringify(initialSongs)),
    comments: JSON.parse(JSON.stringify(initialComments)),
    reactions: JSON.parse(JSON.stringify(initialReactions)),
    weeklySummaries: JSON.parse(JSON.stringify(initialWeeklySummaries))
  };
  saveDb();
}

// Helpers for Pagination
export function paginate(items, page = 1, perPage = 10) {
  const pageNum = Math.max(1, Number(page) || 1);
  const limit = Math.max(1, Math.min(100, Number(perPage) || 10));
  const total = items.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const offset = (pageNum - 1) * limit;
  const data = items.slice(offset, offset + limit);

  return {
    data,
    pagination: {
      total,
      page: pageNum,
      per_page: limit,
      total_pages: totalPages
    }
  };
}

// ----------------- USER & PROFILE (1:1) -----------------
export function findUserByEmail(email) {
  return db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id) {
  const user = db.users.find(u => u.id === id);
  if (!user) return null;
  const profile = db.profiles.find(p => p.user_id === id);
  return { ...user, profile };
}

export function ensureUserExists(userData) {
  if (!userData || !userData.id) return null;
  let user = db.users.find(u => u.id === userData.id);
  if (!user) {
    user = {
      id: userData.id,
      email: userData.email || 'user@lifeloop.app',
      password_hash: '',
      admin_password_hash: '',
      full_name: userData.full_name || 'LifeLoop Member',
      role: userData.role || 'user',
      created_at: new Date().toISOString()
    };
    db.users.push(user);
  }

  let profile = db.profiles.find(p => p.user_id === user.id);
  if (!profile) {
    profile = {
      id: `p-${Date.now()}`,
      user_id: user.id,
      username: `@${(user.full_name || 'user').toLowerCase().replace(/[^a-z0-9]/g, '')}`,
      age: '',
      instagram_handle: '',
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.full_name || 'user')}`,
      bio: 'Hey! I am using LifeLoop to stay close with friends.',
      favorite_quote: 'Memories fade, shared loops stay forever.',
      birthday: '',
      location: ''
    };
    db.profiles.push(profile);
  }

  if (db.spaces.length > 0) {
    const defaultSpace = db.spaces[0];
    if (!db.memberships.some(m => m.space_id === defaultSpace.id && m.user_id === user.id)) {
      db.memberships.push({
        id: `mem-${Date.now()}`,
        space_id: defaultSpace.id,
        user_id: user.id,
        role: 'member',
        joined_at: new Date().toISOString()
      });
    }
  }

  saveDb();
  return { ...user, profile };
}

export function ensureSpaceExists(spaceId, creatorUserId = null) {
  if (!spaceId) return null;
  let space = db.spaces.find(s => s.id === spaceId);
  if (!space) {
    space = {
      id: spaceId,
      name: 'Memory Space',
      description: 'Shared private space for friends and memories.',
      code: spaceId.replace(/^s-/, 'LOOP-'),
      created_by: creatorUserId || 'u-1',
      created_at: new Date().toISOString()
    };
    db.spaces.push(space);

    if (creatorUserId) {
      if (!db.memberships.some(m => m.space_id === spaceId && m.user_id === creatorUserId)) {
        db.memberships.push({
          id: `mem-${Date.now()}`,
          space_id: spaceId,
          user_id: creatorUserId,
          role: 'owner',
          joined_at: new Date().toISOString()
        });
      }
    }

    saveDb();
  }
  return space;
}

export function createUser(userData) {
  const newUser = {
    id: `u-${Date.now()}`,
    email: userData.email,
    password_hash: userData.password_hash,
    admin_password_hash: userData.admin_password_hash || userData.password_hash,
    full_name: userData.full_name,
    role: userData.role || 'user',
    created_at: new Date().toISOString()
  };
  db.users.push(newUser);

  // Automatically create 1:1 Profile
  const defaultUsername = userData.username || `@${userData.full_name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
  const newProfile = {
    id: `p-${Date.now()}`,
    user_id: newUser.id,
    username: defaultUsername,
    age: userData.age || '',
    instagram_handle: userData.instagram_handle || '',
    avatar_url: userData.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(userData.full_name)}`,
    bio: userData.bio || 'Hey! I am using LifeLoop to stay close with friends.',
    favorite_quote: userData.favorite_quote || 'Memories fade, shared loops stay forever.',
    birthday: userData.birthday || '',
    location: userData.location || ''
  };
  db.profiles.push(newProfile);

  saveDb();
  return { ...newUser, profile: newProfile };
}

export function clearAllData() {
  db = {
    users: [],
    profiles: [],
    spaces: [],
    memberships: [],
    moments: [],
    photos: [],
    songs: [],
    comments: [],
    reactions: [],
    weeklySummaries: []
  };
  saveDb();
}

export function getProfileByUserId(userId) {
  return db.profiles.find(p => p.user_id === userId) || null;
}

export function updateProfile(userId, updates) {
  let profile = db.profiles.find(p => p.user_id === userId);
  if (!profile) {
    profile = {
      id: `p-${Date.now()}`,
      user_id: userId,
      username: '',
      age: '',
      instagram_handle: '',
      avatar_url: '',
      bio: '',
      favorite_quote: '',
      birthday: '',
      location: ''
    };
    db.profiles.push(profile);
  }

  const { full_name, ...profileFields } = updates;
  if (full_name) {
    const user = db.users.find(u => u.id === userId);
    if (user) {
      user.full_name = full_name;
    }
  }

  Object.assign(profile, profileFields);
  saveDb();
  return profile;
}

// ----------------- SPACES & MEMBERSHIPS (Many:Many) -----------------
export function getAllSpaces(userId, page = 1, perPage = 10) {
  const enriched = db.spaces.map(space => {
    const memberCount = db.memberships.filter(m => m.space_id === space.id).length;
    const momentsCount = db.moments.filter(m => m.space_id === space.id).length;
    const userMembership = userId ? db.memberships.find(m => m.space_id === space.id && m.user_id === userId) : null;

    return {
      ...space,
      member_count: memberCount,
      moments_count: momentsCount,
      is_member: !!userMembership,
      user_role: userMembership ? userMembership.role : null,
      nickname_in_space: userMembership ? userMembership.nickname_in_space : null
    };
  });

  return paginate(enriched, page, perPage);
}

export function getSpaceById(spaceId, userId) {
  let space = db.spaces.find(s => s.id === spaceId);
  if (!space && spaceId) {
    space = ensureSpaceExists(spaceId, userId);
  }
  if (!space) return null;

  const memberCount = db.memberships.filter(m => m.space_id === space.id).length;
  const momentsCount = db.moments.filter(m => m.space_id === space.id).length;
  const userMembership = userId ? db.memberships.find(m => m.space_id === space.id && m.user_id === userId) : null;

  const members = db.memberships
    .filter(m => m.space_id === space.id)
    .map(m => {
      const u = db.users.find(usr => usr.id === m.user_id);
      const p = db.profiles.find(prf => prf.user_id === m.user_id);
      return {
        ...m,
        user_name: u ? u.full_name : 'Unknown',
        user_email: u ? u.email : '',
        avatar_url: p ? p.avatar_url : ''
      };
    });

  return {
    ...space,
    member_count: memberCount,
    moments_count: momentsCount,
    is_member: !!userMembership,
    user_role: userMembership ? userMembership.role : null,
    members
  };
}

export function createSpace(data) {
  // Generate a friendly shareable invite code (e.g. SQUAD2026 or LIFE-8X9A)
  const randomSuffix = Math.random().toString(36).substring(2, 7).toUpperCase();
  const generatedCode = data.custom_code ? data.custom_code.toUpperCase().trim() : `LIFE-${randomSuffix}`;

  const newSpace = {
    id: `s-${Date.now()}`,
    name: data.name,
    description: data.description,
    icon: data.icon || '🌿',
    cover_url: data.cover_url || 'https://images.unsplash.com/photo-1518173946687-a4c8a383392e?auto=format&fit=crop&w=1200&q=80',
    invite_code: generatedCode,
    created_by: data.created_by,
    created_at: new Date().toISOString()
  };
  db.spaces.push(newSpace);

  // Creator becomes space owner in Many:Many association table
  const user = db.users.find(u => u.id === data.created_by);
  const membership = {
    id: `m-${Date.now()}`,
    user_id: data.created_by,
    space_id: newSpace.id,
    role: 'owner',
    nickname_in_space: user ? user.full_name : 'Creator',
    joined_at: new Date().toISOString()
  };
  db.memberships.push(membership);

  saveDb();
  return { ...newSpace, member_count: 1, moments_count: 0, is_member: true, user_role: 'owner' };
}

export function joinSpaceByInviteCode(userId, inviteCode, nickname) {
  const cleanCode = inviteCode.trim().toUpperCase();
  const space = db.spaces.find(s => s.invite_code.toUpperCase() === cleanCode);
  if (!space) throw new Error(`Invalid invite code "${cleanCode}". Please verify code with group owner.`);

  const existing = db.memberships.find(m => m.space_id === space.id && m.user_id === userId);
  if (existing) return { space, membership: existing, already_member: true };

  const user = db.users.find(u => u.id === userId);
  const membership = {
    id: `m-${Date.now()}`,
    user_id: userId,
    space_id: space.id,
    role: 'member',
    nickname_in_space: nickname || (user ? user.full_name : 'Member'),
    joined_at: new Date().toISOString()
  };
  db.memberships.push(membership);
  saveDb();
  return { space, membership, already_member: false };
}

export function leaveSpace(userId, spaceId) {
  const idx = db.memberships.findIndex(m => m.space_id === spaceId && m.user_id === userId);
  if (idx !== -1) {
    db.memberships.splice(idx, 1);
    saveDb();
    return true;
  }
  return false;
}

// ----------------- MOMENTS, PHOTOS, SONGS (1:Many) -----------------
export function getMoments(options) {
  let moments = [...db.moments];

  if (options.space_id) {
    moments = moments.filter(m => m.space_id === options.space_id);
  }
  if (options.user_id) {
    moments = moments.filter(m => m.user_id === options.user_id);
  }
  if (options.mood) {
    moments = moments.filter(m => m.mood.toLowerCase() === options.mood?.toLowerCase());
  }
  if (options.category) {
    moments = moments.filter(m => m.category.toLowerCase() === options.category?.toLowerCase());
  }
  if (options.tag) {
    const t = options.tag.toLowerCase().replace(/^#/, '');
    moments = moments.filter(m => m.tags && Array.isArray(m.tags) && m.tags.some(tag => tag.toLowerCase().replace(/^#/, '') === t));
  }
  if (options.query) {
    const q = options.query.toLowerCase();
    moments = moments.filter(m => 
      m.title.toLowerCase().includes(q) || 
      m.description.toLowerCase().includes(q) ||
      (m.tags && m.tags.some(t => t.toLowerCase().includes(q)))
    );
  }

  // Sort descending by date/created_at
  moments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Enrich with User info, Space info, Photos, Songs, Comments, Reactions
  const enriched = moments.map(m => enrichMoment(m, options.user_id));

  return paginate(enriched, options.page, options.per_page);
}

export function getMomentById(momentId, currentUserId) {
  const moment = db.moments.find(m => m.id === momentId);
  if (!moment) return null;
  return enrichMoment(moment, currentUserId);
}

function enrichMoment(m, currentUserId) {
  const author = db.users.find(u => u.id === m.user_id);
  const profile = db.profiles.find(p => p.user_id === m.user_id);
  const space = db.spaces.find(s => s.id === m.space_id);

  const photos = db.photos.filter(p => p.moment_id === m.id);
  const song = db.songs.find(s => s.moment_id === m.id) || null;

  const comments = db.comments
    .filter(c => c.moment_id === m.id)
    .map(c => {
      const u = db.users.find(usr => usr.id === c.user_id);
      const pr = db.profiles.find(prf => prf.user_id === c.user_id);
      return {
        ...c,
        user_name: u ? u.full_name : 'Friend',
        user_avatar: pr ? pr.avatar_url : ''
      };
    });

  const reactions = db.reactions.filter(r => r.moment_id === m.id);
  const reactions_count = {
    love: reactions.filter(r => r.type === 'love').length,
    funny: reactions.filter(r => r.type === 'funny').length,
    awesome: reactions.filter(r => r.type === 'awesome').length,
    congrats: reactions.filter(r => r.type === 'congrats').length,
    wow: reactions.filter(r => r.type === 'wow').length
  };

  const user_reaction = currentUserId
    ? reactions.find(r => r.user_id === currentUserId)?.type || null
    : null;

  // Time Capsule lock logic
  const now = new Date();
  const unlockDate = m.unlock_date ? new Date(m.unlock_date) : null;
  const is_locked = unlockDate ? unlockDate > now : false;
  let days_until_unlock = 0;
  if (is_locked && unlockDate) {
    const diffTime = Math.abs(unlockDate - now);
    days_until_unlock = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  return {
    ...m,
    user_name: author ? author.full_name : 'Unknown User',
    user_avatar: profile ? profile.avatar_url : '',
    space_name: space ? space.name : '',
    photos: is_locked ? [] : photos,
    song: is_locked ? null : song,
    audio_url: is_locked ? null : (m.audio_url || null),
    tags: m.tags || [],
    comments: is_locked ? [] : comments,
    comments_count: is_locked ? 0 : comments.length,
    reactions,
    reactions_count,
    user_reaction,
    is_locked,
    days_until_unlock,
    location: m.location || ''
  };
}

export function createMoment(data) {
  if (data.space_id) {
    ensureSpaceExists(data.space_id, data.user_id);
  }
  if (data.user_id) {
    ensureUserExists({ id: data.user_id });
  }

  const momentId = `mom-${Date.now()}`;
  const newMoment = {
    id: momentId,
    space_id: data.space_id,
    user_id: data.user_id,
    title: data.title,
    description: data.description,
    mood: data.mood,
    category: data.category || 'General',
    location: data.location || '',
    unlock_date: data.unlock_date || null,
    audio_url: data.audio_url || null,
    tags: Array.isArray(data.tags) ? data.tags : [],
    date: data.date || new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString()
  };
  db.moments.push(newMoment);

  // Photos (support array of URLs or Base64 file strings)
  if (data.photo_urls && Array.isArray(data.photo_urls)) {
    data.photo_urls.forEach((url, i) => {
      if (url && url.trim()) {
        db.photos.push({
          id: `ph-${Date.now()}-${i}`,
          moment_id: momentId,
          url: url.trim(),
          caption: ''
        });
      }
    });
  }

  // Song (support spotify URL or audio file Base64 string / mp3 link)
  if (data.song && data.song.title) {
    db.songs.push({
      id: `so-${Date.now()}`,
      moment_id: momentId,
      title: data.song.title,
      artist: data.song.artist || 'Unknown Artist',
      spotify_url: data.song.spotify_url || '',
      youtube_url: data.song.youtube_url || '',
      audio_data_url: data.song.audio_data_url || ''
    });
  }

  saveDb();
  return enrichMoment(newMoment, data.user_id);
}

export function deleteMoment(momentId, userId, isAdmin = false) {
  const moment = db.moments.find(m => m.id === momentId);
  if (!moment) return false;

  if (moment.user_id !== userId && !isAdmin) {
    throw new Error('Unauthorized to delete this moment.');
  }

  db.moments = db.moments.filter(m => m.id !== momentId);
  db.photos = db.photos.filter(p => p.moment_id !== momentId);
  db.songs = db.songs.filter(s => s.moment_id !== momentId);
  db.comments = db.comments.filter(c => c.moment_id !== momentId);
  db.reactions = db.reactions.filter(r => r.moment_id !== momentId);

  saveDb();
  return true;
}

// ----------------- COMMENTS & REACTIONS -----------------
export function addComment(momentId, userId, content) {
  const moment = db.moments.find(m => m.id === momentId);
  if (!moment) throw new Error('Moment not found');

  const newComment = {
    id: `c-${Date.now()}`,
    moment_id: momentId,
    user_id: userId,
    content,
    created_at: new Date().toISOString()
  };
  db.comments.push(newComment);
  saveDb();

  const user = db.users.find(u => u.id === userId);
  const profile = db.profiles.find(p => p.user_id === userId);

  return {
    ...newComment,
    user_name: user ? user.full_name : 'Friend',
    user_avatar: profile ? profile.avatar_url : ''
  };
}

export function deleteComment(commentId, userId, isAdmin = false) {
  const comment = db.comments.find(c => c.id === commentId);
  if (!comment) return false;

  if (comment.user_id !== userId && !isAdmin) {
    throw new Error('Unauthorized to delete comment.');
  }

  db.comments = db.comments.filter(c => c.id !== commentId);
  saveDb();
  return true;
}

export function toggleReaction(momentId, userId, type) {
  const idx = db.reactions.findIndex(r => r.moment_id === momentId && r.user_id === userId);

  if (idx !== -1) {
    if (db.reactions[idx].type === type) {
      db.reactions.splice(idx, 1);
    } else {
      db.reactions[idx].type = type;
    }
  } else {
    db.reactions.push({
      id: `r-${Date.now()}`,
      moment_id: momentId,
      user_id: userId,
      type,
      created_at: new Date().toISOString()
    });
  }

  saveDb();
  const moment = getMomentById(momentId, userId);
  return {
    reactions_count: moment?.reactions_count,
    user_reaction: moment?.user_reaction
  };
}

// ----------------- DEEP QUERIES & AGGREGATIONS -----------------
export function getSpaceStats(spaceId) {
  const space = db.spaces.find(s => s.id === spaceId);
  if (!space) return null;

  const moments = db.moments.filter(m => m.space_id === spaceId);
  const momentIds = moments.map(m => m.id);

  const photos = db.photos.filter(p => momentIds.includes(p.moment_id));
  const songs = db.songs.filter(s => momentIds.includes(s.moment_id));
  const comments = db.comments.filter(c => momentIds.includes(c.moment_id));
  const reactions = db.reactions.filter(r => momentIds.includes(r.moment_id));

  const userContributionMap = {};
  moments.forEach(m => {
    userContributionMap[m.user_id] = (userContributionMap[m.user_id] || 0) + 1;
  });

  const top_contributors = Object.entries(userContributionMap)
    .map(([userId, count]) => {
      const u = db.users.find(usr => usr.id === userId);
      const p = db.profiles.find(prf => prf.user_id === userId);
      return {
        user_id: userId,
        name: u ? u.full_name : 'Friend',
        avatar: p ? p.avatar_url : '',
        count
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const moodCounts = {};
  moments.forEach(m => {
    moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
  });
  const totalMoments = moments.length || 1;
  const mood_distribution = Object.entries(moodCounts).map(([mood, count]) => ({
    mood,
    count,
    percentage: Math.round((count / totalMoments) * 100)
  }));

  const catCounts = {};
  moments.forEach(m => {
    catCounts[m.category] = (catCounts[m.category] || 0) + 1;
  });
  const category_distribution = Object.entries(catCounts).map(([category, count]) => ({
    category,
    count
  }));

  const songMap = {};
  songs.forEach(s => {
    const key = `${s.title}-${s.artist}`;
    if (!songMap[key]) {
      songMap[key] = { title: s.title, artist: s.artist, count: 0 };
    }
    songMap[key].count += 1;
  });
  const top_songs = Object.values(songMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  const weekly_activity = [
    { week: 'Week 28', count: 2 },
    { week: 'Week 29', count: 4 },
    { week: 'Week 30', count: 3 },
    { week: 'Week 31 (Current)', count: moments.length }
  ];

  return {
    space_id: spaceId,
    space_name: space.name,
    total_moments: moments.length,
    total_photos: photos.length,
    total_songs: songs.length,
    total_comments: comments.length,
    total_reactions: reactions.length,
    top_contributors,
    mood_distribution,
    category_distribution,
    top_songs,
    weekly_activity
  };
}

// ----------------- WEEKLY TREE VISUAL GENERATOR -----------------
export function getWeeklyTree(spaceId) {
  const space = db.spaces.find(s => s.id === spaceId);
  if (!space) return null;

  const moments = db.moments.filter(m => m.space_id === spaceId);
  const momentIds = moments.map(m => m.id);

  const photos = db.photos.filter(p => momentIds.includes(p.moment_id));
  const songs = db.songs.filter(s => momentIds.includes(s.moment_id));

  const moodCounts = {};
  moments.forEach(m => {
    moodCounts[m.mood] = (moodCounts[m.mood] || 0) + 1;
  });

  let dominantMood = 'happy';
  let maxCount = 0;
  Object.entries(moodCounts).forEach(([m, cnt]) => {
    if (cnt > maxCount) {
      maxCount = cnt;
      dominantMood = m;
    }
  });

  const treeLevel = Math.min(5, Math.max(1, Math.ceil(moments.length / 2)));

  const defaultPhotos = [
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1499209974431-9dac3ada00d7?w=300&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&auto=format&fit=crop&q=80'
  ];

  const branchPositions = [
    { x: 250, y: 50 },   // Top crown
    { x: 140, y: 160 },  // Left main branch tip
    { x: 470, y: 120 },  // Right main branch tip
    { x: 150, y: 70 },   // High left tip
    { x: 310, y: 70 },   // Upper right
    { x: 190, y: 95 },   // Upper left
    { x: 200, y: 190 },  // Left branch inner
    { x: 390, y: 155 },  // Right branch inner
    { x: 290, y: 130 },  // Center upper
    { x: 430, y: 85 },   // High right branch
    { x: 230, y: 230 },  // Lower left
    { x: 340, y: 190 }   // Lower right
  ];

  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const fullDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const leafNodes = moments.slice(0, 12).map((mom, idx) => {
    const author = db.users.find(u => u.id === mom.user_id);
    const photo = db.photos.find(p => p.moment_id === mom.id);
    const pos = branchPositions[idx % branchPositions.length];
    
    // Determine day of week
    let dayShort = daysOfWeek[idx % 7];
    let dayFull = fullDays[idx % 7];
    if (mom.created_at) {
      const d = new Date(mom.created_at);
      if (!isNaN(d.getTime())) {
        const dayIdx = (d.getDay() + 6) % 7; // Monday = 0
        dayShort = daysOfWeek[dayIdx];
        dayFull = fullDays[dayIdx];
      }
    }

    return {
      id: mom.id,
      title: mom.title,
      author: author ? author.full_name : 'Friend',
      mood: mom.mood,
      category: mom.category,
      created_at: mom.created_at || new Date().toISOString(),
      day_short: dayShort,
      day_full: dayFull,
      photo_url: photo ? photo.url : defaultPhotos[idx % defaultPhotos.length],
      x: pos.x,
      y: pos.y
    };
  });

  return {
    space_id: spaceId,
    space_name: space.name,
    week_number: 31,
    year: 2026,
    tree_level: treeLevel,
    moments_count: moments.length,
    photos_count: photos.length,
    songs_count: songs.length,
    dominant_mood: dominantMood,
    summary_text: `This week in ${space.name}, ${moments.length} moments and ${photos.length} photos were shared! The overall dominant mood was ${dominantMood.toUpperCase()}.`,
    nodes: leafNodes
  };
}

// ----------------- ADMIN STATS -----------------
export function getAdminStats() {
  const activeSpaces = db.spaces.map(s => ({
    name: s.name,
    moments_count: db.moments.filter(m => m.space_id === s.id).length,
    members_count: db.memberships.filter(m => m.space_id === s.id).length
  })).sort((a, b) => b.moments_count - a.moments_count);

  const recentUsers = db.users
    .slice(-5)
    .reverse()
    .map(u => ({
      email: u.email,
      full_name: u.full_name,
      role: u.role,
      created_at: u.created_at
    }));

  return {
    total_users: db.users.length,
    total_spaces: db.spaces.length,
    total_moments: db.moments.length,
    total_comments: db.comments.length,
    total_reactions: db.reactions.length,
    top_active_spaces: activeSpaces,
    recent_registrations: recentUsers
  };
}

export function getAllUsersForAdmin(page = 1, perPage = 10) {
  const enriched = db.users.map(u => {
    const profile = db.profiles.find(p => p.user_id === u.id);
    const momentsCount = db.moments.filter(m => m.user_id === u.id).length;
    return {
      ...u,
      profile,
      moments_count: momentsCount
    };
  });

  return paginate(enriched, page, perPage);
}
