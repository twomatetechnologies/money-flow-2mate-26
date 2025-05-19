
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import React from "react";

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isAuthenticated, isLoading } = useAuth(); // Changed loading to isLoading
  const location = useLocation();

  if (isLoading) { // Changed loading to isLoading
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated()) { // Ensure isAuthenticated is called as a function
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
