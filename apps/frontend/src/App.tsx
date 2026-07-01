import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// 引入頁面元件
import IndexPage from './pages/IndexPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Setup2FAPage from './pages/Setup2FAPage';
import UserPage from './pages/UserPage';
import FriendRequestsPage from './pages/FriendRequestsPage';
import BannedPage from './pages/BannedPage';

// Context
import { AuthProvider } from './context/AuthContext';

const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const AdminUserPage = React.lazy(() => import('./pages/AdminUserPage'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <Toaster position="top-center" reverseOrder={false} />
        <Navbar />

        <main className="max-w-7xl mx-auto px-6 py-8">
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route
              path="/reset-password/:token"
              element={<ResetPasswordPage />}
            />
            <Route path="/banned" element={<BannedPage />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/profile/:userId" element={<UserPage />} />
              <Route path="/profile/2fa-setup" element={<Setup2FAPage />} />
              <Route path="/admin/users" element={<AdminUserPage />} />
              <Route path="/friend-requests" element={<FriendRequestsPage />} />
            </Route>
          </Routes>
        </main>
      </AuthProvider>
    </Router>
  );
}

export default App;
