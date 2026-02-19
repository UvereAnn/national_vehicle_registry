import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';
import VehicleForm from './pages/VehicleForm';
import PlateVerification from './pages/PlateVerification';
import NotFoundPage from './pages/NotFoundPage';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-700 border-t-transparent"></div></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/unauthorized" replace />;
  return children;
};

const RoleRedirect = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (['super_admin', 'admin_officer'].includes(user.role)) return <Navigate to="/admin" />;
  return <Navigate to="/staff" />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/verify" element={<PlateVerification />} />
          <Route path="/dashboard" element={<ProtectedRoute><RoleRedirect /></ProtectedRoute>} />
          <Route path="/admin/*" element={
            <ProtectedRoute roles={['super_admin', 'admin_officer']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/staff/*" element={
            <ProtectedRoute roles={['registration_staff']}>
              <StaffDashboard />
            </ProtectedRoute>
          } />
          <Route path="/vehicles/new" element={
            <ProtectedRoute roles={['registration_staff']}>
              <VehicleForm />
            </ProtectedRoute>
          } />
          <Route path="/vehicles/:id/edit" element={
            <ProtectedRoute roles={['registration_staff']}>
              <VehicleForm />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
