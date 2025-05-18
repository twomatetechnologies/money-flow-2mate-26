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
import TwoFactorAuth from '@/pages/TwoFactorAuth';
import Stocks from '@/pages/Stocks';
import SIPInvestments from '@/pages/SIPInvestments';
import FixedDeposits from '@/pages/FixedDeposits';
import SavingsAccounts from '@/pages/SavingsAccounts';
import ProvidentFund from '@/pages/ProvidentFund';
import Insurance from '@/pages/Insurance';
import Gold from '@/pages/Gold';
import Goals from '@/pages/Goals';
import Reports from '@/pages/Reports';
import FamilyMembers from './pages/FamilyMembers';
import AuditTrail from './pages/AuditTrail';
// Initialize database preferences on app start - before auth provider
// This ensures the correct storage system is configured before any auth or data operations
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
  // Add a small initialization state so we can show a loading screen if needed
  const [initialized, setInitialized] = useState(false);
  
  useEffect(() => {
    // Any additional initialization can go here
    setInitialized(true);
  }, []);
  
  if (!initialized) {
    return <div>Initializing application...</div>;
  }

  return (
    <AuthProvider>
      <SettingsProvider>
        <Router>
          <PreventBackNavigation>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/two-factor-auth" element={<TwoFactorAuth />} />
              <Route
                element={
                  <AuthGuard>
                    <AppLayout />
                  </AuthGuard>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/stocks" element={<Stocks />} />
                <Route path="/sip-investments" element={<SIPInvestments />} />
                <Route path="/fixed-deposits" element={<FixedDeposits />} />
                <Route path="/savings-accounts" element={<SavingsAccounts />} />
                <Route path="/provident-fund" element={<ProvidentFund />} />
                <Route path="/insurance" element={<Insurance />} />
                <Route path="/gold" element={<Gold />} />
                <Route path="/goals" element={<Goals />} /> 
                <Route path="/family-members" element={<FamilyMembers />} />
                <Route path="/audit-trail" element={<AuditTrail />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/ai-settings" element={<AISettings />} />
                <Route path="/api-endpoints" element={<ApiEndpoints />} />
              </Route>
            </Routes>
          </PreventBackNavigation>
        </Router>
        <Toaster />
      </SettingsProvider>
    </AuthProvider>
  );
};
``
export default App;
