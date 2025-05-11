
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import Settings from '@/pages/Settings';
import AISettings from '@/pages/AISettings';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { Toaster } from "@/components/ui/toaster";
import { initDatabasePreferences } from '@/services/db/dbConnector';
import AppLayout from '@/components/layout/AppLayout';
import ApiEndpoints from '@/pages/ApiEndpoints';

// Initialize database preferences on app start
initDatabasePreferences();

// AuthGuard component to protect routes
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // Wait for authentication status to be determined
  if (loading) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Prevent Back Navigation after Logout
const PreventBackNavigation = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  useEffect(() => {
    const handleBackButton = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBackButton);

    return () => {
      window.removeEventListener("beforeunload", handleBackButton);
    };
  }, [location]);

  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <PreventBackNavigation>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={
                <AuthGuard>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </AuthGuard>
              } />
              <Route path="/settings" element={
                <AuthGuard>
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </AuthGuard>
              } />
              <Route path="/ai-settings" element={
                <AuthGuard>
                  <AppLayout>
                    <AISettings />
                  </AppLayout>
                </AuthGuard>
              } />
              <Route path="/api-endpoints" element={
                <AuthGuard>
                  <AppLayout>
                    <ApiEndpoints />
                  </AppLayout>
                </AuthGuard>
              } />
            </Routes>
          </PreventBackNavigation>
        </Router>
        <Toaster />
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;
