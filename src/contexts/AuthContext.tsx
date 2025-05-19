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
      
      // If PostgreSQL is enabled, verify credentials against the database
      if (isPostgresEnabled()) {
        // Get user from database by email
        const dbUser = await getUserByEmail(email);
        
        // In a real app, we would verify the password with bcrypt
        // For demo, we're just checking if the user exists
        if (!dbUser) {
          console.error("User not found in database");
          return { success: false };
        }

        // Simulate password check - in a real app, this would be secure
        // For now, let's assume if user exists, login is successful for DB users (excluding 2FA test)
        // unless it's the specific 2FA test user.
        
        // For 2FA testing
        if (email === 'test@example.com' && password === 'password') {
          // Don't set user yet, 2FA step will handle it
          return { success: true, requires2FA: true };
        }
        
        const loggedInUser = {
          id: dbUser.id,
          name: dbUser.name,
          email: dbUser.email,
          role: dbUser.role || 'user'
        };
        
        setUser(loggedInUser);
        localStorage.setItem('auth_user', JSON.stringify(loggedInUser));
        
        return { success: true };
      } else {
        // Demo mode for Lovable preview - only check specific credentials
        if (email === 'user@example.com' && password === 'password') {
          const demoUser = {
            id: 'demo-user',
            name: 'Demo User',
            email: 'user@example.com',
            role: 'admin' // Demo user is admin for isDevelopmentMode testing
          };
          
          setUser(demoUser);
          localStorage.setItem('auth_user', JSON.stringify(demoUser));
          
          return { success: true };
        } else if (email === 'test@example.com' && password === 'password') {
          // For 2FA testing
          return { success: true, requires2FA: true };
        }
        
        return { success: false };
      }
    } catch (error) {
      console.error("Error during login:", error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    navigate('/login');
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
