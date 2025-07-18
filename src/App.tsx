import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient } from 'react-query';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/login';
import RegisterPage from '@/pages/register';
import PricingPage from '@/pages/pricing';
import DashboardPage from '@/pages/dashboard';
import CreateMaterial from '@/pages/create-material';
import MaterialsPage from '@/pages/materials';
import EditMaterialPage from '@/pages/edit-material';
import CalendarPage from '@/pages/calendar';
import SchoolPage from '@/pages/school';
import SettingsPage from '@/pages/settings';
import NotificationsPage from '@/pages/notifications';
import UsersPage from '@/pages/users';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import ForgotPasswordPage from '@/pages/forgot-password';
import ResetPasswordPage from '@/pages/reset-password';

import WebhookLogsPage from '@/components/admin/WebhookLogsPage';

function App() {
  return (
    <BrowserRouter>
      <QueryClient>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 ml-64">
                        <Header />
                        <DashboardPage />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 ml-64">
                        <Header />
                        <DashboardPage />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/create-material"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 ml-64">
                        <Header />
                        <CreateMaterial />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/materials"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 ml-64">
                        <Header />
                        <MaterialsPage />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/edit-material/:id"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 ml-64">
                        <Header />
                        <EditMaterialPage />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 ml-64">
                        <Header />
                        <CalendarPage />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/school"
                element={
                  <ProtectedRoute requiredPermission="canAccessSchool">
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 ml-64">
                        <Header />
                        <SchoolPage />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/settings"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 ml-64">
                        <Header />
                        <SettingsPage />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 ml-64">
                        <Header />
                        <NotificationsPage />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/users"
                element={
                  <ProtectedRoute requiredPermission="canAccessSettings">
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 ml-64">
                        <Header />
                        <UsersPage />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
              
              {/* Admin Routes */}
              <Route
                path="/admin/webhooks"
                element={
                  <ProtectedRoute requiredPermission="canAccessSettings">
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 ml-64">
                        <Header />
                        <WebhookLogsPage />
                      </main>
                    </div>
                  </ProtectedRoute>
                }
              />
              
            </Routes>
            <Toaster />
          </div>
        </AuthProvider>
      </QueryClient>
    </BrowserRouter>
  );
}

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermission?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermission,
}) => {
  const { user, isAuthenticated, hasPermission, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" />;
  }

  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
};

export default App;
