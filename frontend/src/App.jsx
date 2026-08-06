import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { SettingsProvider } from './context/SettingsContext.jsx';
import { useAuth } from './hooks/useAuth.js';
import { useFetch } from './hooks/useFetch.js';

import { Navbar } from './components/Navbar.jsx';
import { Sidebar } from './components/Sidebar.jsx';
import { AmbientBackground } from './components/AmbientBackground.jsx';
import { ProfileSetupModal } from './components/ProfileSetupModal.jsx';
import { MomentModal } from './components/MomentModal.jsx';
import { CreateSpaceModal } from './components/CreateSpaceModal.jsx';
import { JoinSpaceModal } from './components/JoinSpaceModal.jsx';

import { LoginPage } from './pages/LoginPage.jsx';
import { RegisterPage } from './pages/RegisterPage.jsx';
import { DashboardPage } from './pages/DashboardPage.jsx';
import { SpacesPage } from './pages/SpacesPage.jsx';
import { SpaceDetailPage } from './pages/SpaceDetailPage.jsx';
import { MomentsPage } from './pages/MomentsPage.jsx';
import { WeeklyTreePage } from './pages/WeeklyTreePage.jsx';
import { ScrapbookPage } from './pages/ScrapbookPage.jsx';
import { StatsPage } from './pages/StatsPage.jsx';
import { ProfilePage } from './pages/ProfilePage.jsx';
import { AdminPage } from './pages/AdminPage.jsx';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-xs">
        Loading LifeLoop application...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  return children;
};

const MainLayout = () => {
  const { user } = useAuth();

  // Modals state
  const [isMomentModalOpen, setIsMomentModalOpen] = useState(false);
  const [selectedSpaceForMoment, setSelectedSpaceForMoment] = useState('');
  const [isCreateSpaceModalOpen, setIsCreateSpaceModalOpen] = useState(false);
  const [isJoinSpaceModalOpen, setIsJoinSpaceModalOpen] = useState(false);

  // User's spaces for modals
  const { data: spacesRes, refetch: refetchUserSpaces } = useFetch(
    user ? `/api/spaces?user_id=${user.id}&per_page=50` : ''
  );
  const userSpaces = spacesRes?.data || [];

  const handleOpenMomentModalWithSpace = (spaceId) => {
    if (spaceId) setSelectedSpaceForMoment(spaceId);
    setIsMomentModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col selection:bg-blue-900 selection:text-white relative overflow-x-hidden">
      {/* Ambient Animated Background */}
      <AmbientBackground />

      {/* Top Navbar */}
      <Navbar onOpenNewMoment={() => setIsMomentModalOpen(true)} />

      <div className="flex flex-1">
        {/* Left Sidebar */}
        <Sidebar />

        {/* Main Content Viewport */}
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 overflow-y-auto">
          <Routes>
            <Route
              path="/"
              element={
                <DashboardPage
                  onOpenNewMomentModal={() => setIsMomentModalOpen(true)}
                  onOpenJoinSpaceModal={() => setIsJoinSpaceModalOpen(true)}
                  onOpenCreateSpaceModal={() => setIsCreateSpaceModalOpen(true)}
                />
              }
            />
            <Route
              path="/spaces"
              element={
                <SpacesPage
                  onOpenCreateSpaceModal={() => setIsCreateSpaceModalOpen(true)}
                  onOpenJoinSpaceModal={() => setIsJoinSpaceModalOpen(true)}
                />
              }
            />
            <Route
              path="/spaces/:id"
              element={
                <SpaceDetailPage
                  onOpenNewMomentModalWithSpace={handleOpenMomentModalWithSpace}
                />
              }
            />
            <Route path="/moments" element={<MomentsPage />} />
            <Route path="/weekly-tree" element={<WeeklyTreePage />} />
            <Route path="/scrapbook" element={<ScrapbookPage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminPage />
                </AdminRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Modals */}
      <ProfileSetupModal />

      <MomentModal
        isOpen={isMomentModalOpen}
        onClose={() => setIsMomentModalOpen(false)}
        spaces={userSpaces}
        defaultSpaceId={selectedSpaceForMoment}
        onMomentCreated={() => {
          refetchUserSpaces();
        }}
      />

      <CreateSpaceModal
        isOpen={isCreateSpaceModalOpen}
        onClose={() => setIsCreateSpaceModalOpen(false)}
        onSpaceCreated={() => {
          refetchUserSpaces();
        }}
      />

      <JoinSpaceModal
        isOpen={isJoinSpaceModalOpen}
        onClose={() => setIsJoinSpaceModalOpen(false)}
        onSpaceJoined={() => {
          refetchUserSpaces();
        }}
      />
    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </SettingsProvider>
    </AuthProvider>
  );
}

export default App;
