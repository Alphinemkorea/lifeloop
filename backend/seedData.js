import bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);
const defaultPasswordHash = bcrypt.hashSync('password123', salt);
const adminPasswordHash = bcrypt.hashSync('mkorea2308', salt);

export const initialUsers = [
  {
    id: 'u-1',
    email: 'alex@lifeloop.app',
    password_hash: defaultPasswordHash,
    full_name: 'Alex Johnson',
    role: 'user',
    created_at: '2026-06-01T10:00:00Z'
  },
  {
    id: 'u-2',
    email: 'sarah@lifeloop.app',
    password_hash: defaultPasswordHash,
    full_name: 'Sarah Chen',
    role: 'user',
    created_at: '2026-06-02T11:30:00Z'
  },
  {
    id: 'u-3',
    email: 'marcus@lifeloop.app',
    password_hash: defaultPasswordHash,
    full_name: 'Marcus Vance',
    role: 'user',
    created_at: '2026-06-05T09:15:00Z'
  },
  {
    id: 'u-4',
    email: 'elena@lifeloop.app',
    password_hash: defaultPasswordHash,
    full_name: 'Elena Rostova',
    role: 'user',
    created_at: '2026-06-10T14:20:00Z'
  },
  {
    id: 'u-5',
    email: 'jordan@lifeloop.app',
    password_hash: defaultPasswordHash,
    full_name: 'Jordan Miller',
    role: 'user',
    created_at: '2026-06-12T16:45:00Z'
  },
  {
    id: 'u-admin',
    email: 'mkorea@gmail.com',
    password_hash: adminPasswordHash,
    full_name: 'MKorea Admin',
    role: 'admin',
    created_at: '2026-05-01T08:00:00Z'
  }
];

export const initialProfiles = [
  {
    id: 'p-1',
    user_id: 'u-1',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Software & Design enthusiast. Coffee addict ☕. Scrapbooking life one week at a time!',
    favorite_quote: 'Stay hungry, stay foolish.',
    birthday: '1999-04-12',
    location: 'San Francisco, CA'
  },
  {
    id: 'p-2',
    user_id: 'u-2',
    avatar_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
    bio: 'Photographer & Weekend Hiker. Always looking for the next sunset 🌅',
    favorite_quote: 'Life is either a daring adventure or nothing at all.',
    birthday: '2000-08-25',
    location: 'Seattle, WA'
  },
  {
    id: 'p-3',
    user_id: 'u-3',
    avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Music addict 🎧, bass guitarist, and tech tinkerer.',
    favorite_quote: 'Where words fail, music speaks.',
    birthday: '1998-11-03',
    location: 'Austin, TX'
  },
  {
    id: 'p-4',
    user_id: 'u-4',
    avatar_url: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=400&q=80',
    bio: 'Foodie traveler 🍕, amateur baker, and dog mom 🐶',
    favorite_quote: 'Good food is good mood.',
    birthday: '2001-02-18',
    location: 'Chicago, IL'
  },
  {
    id: 'p-5',
    user_id: 'u-5',
    avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: 'Trail runner & camping aficionado. Living life outdoor 🌲',
    favorite_quote: 'Not all who wander are lost.',
    birthday: '1999-09-30',
    location: 'Denver, CO'
  },
  {
    id: 'p-admin',
    user_id: 'u-admin',
    avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    bio: 'LifeLoop Community Moderator & Administrator.',
    favorite_quote: 'Building connections, preserving memories.',
    birthday: '1995-01-01',
    location: 'Global Hub'
  }
];

export const initialSpaces = [];
export const initialMemberships = [];
export const initialMoments = [];
export const initialPhotos = [];
export const initialSongs = [];
export const initialComments = [];
export const initialReactions = [];
export const initialWeeklySummaries = [];
