import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import Settings from '@/pages/Settings';
import AISettings from '@/pages/AISettings';
import AuditLogs from '@/pages/AuditLogs';
import TwoFactor from '@/pages/TwoFactor';
import ForgotPassword from '@/pages/ForgotPassword';
import ResetPassword from '@/pages/ResetPassword';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { SettingsProvider } from '@/contexts/SettingsContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { initDatabasePreferences } from '@/services/db/dbConnector';
import AppLayout from '@/components/layout/AppLayout';
import Docs from '@/pages/Docs';
import ApiEndpoints from '@/pages/ApiEndpoints';

// Initialize database preferences on app start
initDatabasePreferences();

// AuthGuard component to protect routes
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Wait for authentication status to be determined
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Prevent Back Navigation after Logout
const PreventBackNavigation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />
              <Route path="/two-factor" element={<TwoFactor />} />
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
              <Route path="/audit-logs" element={
                <AuthGuard>
                  <AppLayout>
                    <AuditLogs />
                  </AppLayout>
                </AuthGuard>
              } />
              <Route path="/docs" element={
                <AuthGuard>
                  <AppLayout>
                    <Docs />
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
        <ToastContainer position="bottom-right" autoClose={5000} />
      </SettingsProvider>
    </AuthProvider>
  );
};

export default App;
