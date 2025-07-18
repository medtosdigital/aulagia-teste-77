
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from './contexts/AuthContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/pages/LoginPage';
import DashboardPage from '@/pages/dashboard';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';

import WebhookLogsPage from '@/components/admin/WebhookLogsPage';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <div className="min-h-screen bg-background">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <div className="flex min-h-screen">
                      <Sidebar />
                      <main className="flex-1 ml-64">
                        <Header title="Dashboard" />
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
                        <Header title="Dashboard" />
                        <DashboardPage />
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
                        <Header title="Webhook Logs" />
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
      </QueryClientProvider>
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
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // For now, we'll skip permission checking since we don't have hasPermission implemented
  // if (requiredPermission && !hasPermission(requiredPermission)) {
  //   return <Navigate to="/dashboard" />;
  // }

  return <>{children}</>;
};

export default App;
