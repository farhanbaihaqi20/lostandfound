import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';

// User Pages
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExplorePage } from './pages/ExplorePage';
import { ItemDetailPage } from './pages/ItemDetailPage';
import { ReportPage } from './pages/ReportPage';
import { MessagesPage } from './pages/MessagesPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { ModerationPage } from './pages/admin/ModerationPage';
import { ClaimModerationPage } from './pages/admin/ClaimModerationPage';
import { OrdersPage } from './pages/admin/OrdersPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

function App() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      
      <main style={{ flex: 1 }}>
        <Routes>
          {/* Public & Core Pages */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/beranda" element={<DashboardPage />} />
          <Route path="/jelajahi" element={<ExplorePage />} />
          <Route path="/barang/:id" element={<ItemDetailPage />} />
          <Route path="/pengaturan" element={<SettingsPage />} />

          {/* Auth Pages */}
          <Route path="/masuk" element={<LoginPage />} />
          <Route path="/daftar" element={<RegisterPage />} />

          {/* Protected User Pages */}
          <Route 
            path="/lapor/:type" 
            element={
              <ProtectedRoute>
                <ReportPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pesan" 
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/pesan/:matchId" 
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/notifikasi" 
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profil" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />

          {/* Admin Protected Pages */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/moderasi" 
            element={
              <AdminRoute>
                <ModerationPage />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/klaim" 
            element={
              <AdminRoute>
                <ClaimModerationPage />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/pesanan" 
            element={
              <AdminRoute>
                <OrdersPage />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/pengguna" 
            element={
              <AdminRoute>
                <AdminUsersPage />
              </AdminRoute>
            } 
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/beranda" replace />} />
        </Routes>
      </main>

      <BottomNav />
    </div>
  );
}

export default App;
