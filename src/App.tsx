
import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { SettingsProvider } from "./contexts/SettingsContext";
import Dashboard from "./pages/Dashboard";
import Stocks from "./pages/Stocks";
import FixedDeposits from "./pages/FixedDeposits";
import SIPInvestments from "./pages/SIPInvestments";
import Insurance from "./pages/Insurance";
import Gold from "./pages/Gold";
import Reports from "./pages/Reports";
import AuditTrail from "./pages/AuditTrail";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Create a QueryClient instance with appropriate configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SettingsProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/stocks" element={<Stocks />} />
                <Route path="/fixed-deposits" element={<FixedDeposits />} />
                <Route path="/sip" element={<SIPInvestments />} />
                <Route path="/insurance" element={<Insurance />} />
                <Route path="/gold" element={<Gold />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/audit" element={<AuditTrail />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </SettingsProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
