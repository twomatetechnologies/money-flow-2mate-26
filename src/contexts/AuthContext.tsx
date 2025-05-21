import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { isPostgresEnabled } from '@/services/db/dbConnector';
import { getUserByEmail, updateUser as updateUserInDb } from '@/services/userService';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; requires2FA?: boolean }>;
  logout: () => void;
  isAuthenticated: () => boolean;
  updateUser: (data: { name?: string; email?: string }) => Promise<void>;
  isDevelopmentMode: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true); // Set loading true at the start of the check
      try {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        localStorage.removeItem('auth_user');
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; requires2FA?: boolean }> => {
    try {
      setIsLoading(true);
      
      // Call the login API endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      // If the request failed, return false
      if (!response.ok) {
        console.error("Login failed:", await response.text());
        return { success: false };
      }

      // Parse the response
      const data = await response.json();
      
      // Check if 2FA is required
      if (data.requiresTwoFactor) {
        // Store the token for 2FA verification
        localStorage.setItem('auth_temp_token', data.token);
        return { success: true, requires2FA: true };
      }
      
      // Store user and token data
      setUser(data.user);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      localStorage.setItem('auth_token', data.token);
      
      return { success: true };
    } catch (error) {
      console.error("Error during login:", error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      if (token) {
        // Call the logout API endpoint
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error("Error during logout:", error);
    } finally {
      // Clear user data regardless of API call success
      setUser(null);
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_temp_token');
      navigate('/login');
    }
  };

  const isAuthenticated = () => {
    return user !== null;
  };

  // Implement updateUser function
  const updateUser = async (data: { name?: string; email?: string }) => {
    if (!user) {
      console.error("No user to update.");
      throw new Error("User not authenticated");
    }

    const originalUser = { ...user }; // Keep a copy of the original user state for rollback
    setIsLoading(true);
    try {
      const updatedUserData = { ...user, ...data };
      setUser(updatedUserData);
      localStorage.setItem('auth_user', JSON.stringify(updatedUserData));

      if (isPostgresEnabled()) {
        // Assuming updateUserInDb takes userId and a partial user object
        await updateUserInDb(user.id, data); 
      }
      // Successfully updated
    } catch (error) {
      console.error("Error updating user profile:", error);
      // Rollback UI changes if DB update fails
      setUser(originalUser);
      localStorage.setItem('auth_user', JSON.stringify(originalUser));
      throw error; // Re-throw error to be handled by the calling component (e.g., to show a toast)
    } finally {
      setIsLoading(false);
    }
  };

  // Derive isDevelopmentMode based on user role
  const isDevelopmentMode = useMemo(() => {
    // Example: 'admin' role enables development mode features
    // Or, could be based on a specific flag on the user object or environment variable
    return user?.role === 'admin';
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated, updateUser, isDevelopmentMode }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
