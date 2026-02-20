import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AuthCallbackPage from './pages/AuthCallbackPage';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import FeedPage from './pages/FeedPage';
import SearchPage from './pages/SearchPage';
import NotFoundPage from './pages/NotFoundPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token, isLoading } = useAuthStore();

  if (isLoading) return <div className="loading-screen">Loading...</div>;
  if (!token && !isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
}

export default function App() {
  const { fetchMe, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      fetchMe();
    }
  }, [token]);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login/callback" element={<AuthCallbackPage />} />

      {/* App layout */}
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route
          path="feed"
          element={<ProtectedRoute><FeedPage /></ProtectedRoute>}
        />
        <Route
          path="edit-profile"
          element={<ProtectedRoute><EditProfilePage /></ProtectedRoute>}
        />
        <Route path="search" element={<SearchPage />} />
        <Route path="u/:username" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
