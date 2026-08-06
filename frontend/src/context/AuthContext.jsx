import React, { createContext, useState, useEffect, useCallback } from 'react';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('lifeloop_token') || null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async (authToken) => {
    if (!authToken) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setProfile(data.user?.profile || null);
      } else {
        localStorage.removeItem('lifeloop_token');
        setToken(null);
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.error('Failed to fetch current user:', err);
      localStorage.removeItem('lifeloop_token');
      setToken(null);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setLoading(false);
    }

    const handleUnauthorized = () => {
      console.warn('Received 401 Unauthorized from backend API. Clearing invalid token.');
      localStorage.removeItem('lifeloop_token');
      setToken(null);
      setUser(null);
      setProfile(null);
    };

    window.addEventListener('lifeloop:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('lifeloop:unauthorized', handleUnauthorized);
    };
  }, [token, fetchCurrentUser]);

  const login = (newToken, userData) => {
    localStorage.setItem('lifeloop_token', newToken);
    setToken(newToken);
    setUser(userData);
    setProfile(userData?.profile || null);
  };

  const logout = () => {
    localStorage.removeItem('lifeloop_token');
    setToken(null);
    setUser(null);
    setProfile(null);
  };

  const updateProfileState = (updatedProfile) => {
    setProfile(updatedProfile);
    setUser((prev) => (prev ? { ...prev, profile: updatedProfile } : prev));
  };

  const refetchUser = async () => {
    if (token) {
      await fetchCurrentUser(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        profile,
        loading,
        login,
        logout,
        updateProfileState,
        refetchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
