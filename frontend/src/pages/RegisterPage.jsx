import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { parseApiResponse } from '../utils/api.js';
import { Mail, Lock, User, AtSign, Calendar, Instagram, Shield, UserPlus } from 'lucide-react';

export const RegisterPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [instagramHandle, setInstagramHandle] = useState('');
  const [bio, setBio] = useState('');
  const [role, setRole] = useState('user');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          admin_password: adminPassword || password,
          full_name: fullName,
          username: username.startsWith('@') ? username : `@${username.toLowerCase().replace(/\s+/g, '')}`,
          age,
          instagram_handle: instagramHandle,
          bio,
          role
        })
      });

      const data = await parseApiResponse(res);

      login(data.token, data.user);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4 my-6">
      <div className="bg-white border border-slate-200 rounded-3xl p-8 w-full max-w-lg shadow-xl space-y-6 text-slate-800">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-blue-900 text-white flex items-center justify-center font-black text-xl shadow-md">
            🌿
          </div>
          <h1 className="text-2xl font-black text-blue-950">Join LifeLoop Scrapbook</h1>
          <p className="text-xs text-slate-500">Create your account to connect with friends & share memory loops</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-blue-950 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-blue-900" />
                <span>Full Name *</span>
              </label>
              <input
                type="text"
                placeholder="Maya Lin"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900 font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-blue-950 mb-1 flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5 text-blue-900" />
                <span>Username</span>
              </label>
              <input
                type="text"
                placeholder="@mayalin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-blue-950 mb-1 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-900" />
              <span>Email Address *</span>
            </label>
            <input
              type="email"
              placeholder="maya@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900 font-medium"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-blue-950 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-900" />
                <span>Password *</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900 font-medium"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-blue-950 mb-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-900" />
                <span>Admin Password (Optional)</span>
              </label>
              <input
                type="password"
                placeholder="admin123"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900 font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-blue-950 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-900" />
                <span>Age</span>
              </label>
              <input
                type="number"
                placeholder="22"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900"
              />
            </div>

            <div>
              <label className="block font-bold text-blue-950 mb-1 flex items-center gap-1.5">
                <Instagram className="w-3.5 h-3.5 text-pink-600" />
                <span>Instagram Handle</span>
              </label>
              <input
                type="text"
                placeholder="@maya_moments"
                value={instagramHandle}
                onChange={(e) => setInstagramHandle(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:border-blue-900"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-blue-950 mb-1">Account Role</label>
            <div className="flex items-center gap-4 pt-1">
              <label className="flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="radio"
                  name="role"
                  value="user"
                  checked={role === 'user'}
                  onChange={() => setRole('user')}
                  className="accent-blue-900"
                />
                <span>Standard Member</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-semibold">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={() => setRole('admin')}
                  className="accent-blue-900"
                />
                <span>Administrator</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs shadow-md disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
          </button>
        </form>

        <div className="pt-2 border-t border-slate-100 text-center text-xs text-slate-500">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-blue-900 hover:underline">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
