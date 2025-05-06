
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import TwoFactorAuth from './pages/TwoFactorAuth';
import NotFound from './pages/NotFound';
import { AuthProvider } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import AppLayout from './components/layout/AppLayout';
import { AuthGuard } from './components/auth/AuthGuard';
import Dashboard from './pages/Dashboard';
import Stocks from './pages/Stocks';
import FixedDeposits from './pages/FixedDeposits';
import SIPInvestments from './pages/SIPInvestments';
import Insurance from './pages/Insurance';
import Gold from './pages/Gold';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AISettings from './pages/AISettings';
import AuditTrail from './pages/AuditTrail';
import FamilyMembers from './pages/FamilyMembers';
import SavingsAccounts from './pages/SavingsAccounts';
import { Toaster } from './components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import Profile from './pages/Profile';
import Goals from './pages/Goals';
import ProvidentFund from './pages/ProvidentFund';

function App() {
  // Create the QueryClient instance outside of the component body
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SettingsProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/two-factor-auth" element={<TwoFactorAuth />} />
              <Route
                path="/"
                element={
                  <AuthGuard>
                    <AppLayout />
                  </AuthGuard>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="stocks" element={<Stocks />} />
                <Route path="fixed-deposits" element={<FixedDeposits />} />
                <Route path="savings-accounts" element={<SavingsAccounts />} />
                <Route path="sip-investments" element={<SIPInvestments />} />
                <Route path="provident-fund" element={<ProvidentFund />} />
                <Route path="insurance" element={<Insurance />} />
                <Route path="gold" element={<Gold />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="ai-settings" element={<AISettings />} />
                <Route path="audit-trail" element={<AuditTrail />} />
                <Route path="family-members" element={<FamilyMembers />} />
                <Route path="profile" element={<Profile />} />
                <Route path="goals" element={<Goals />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </SettingsProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
