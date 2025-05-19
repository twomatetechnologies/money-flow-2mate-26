
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { isPostgresEnabled } from '@/services/db/dbConnector';
import { getUserByEmail } from '@/services/userService';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Check if user is already logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('auth_user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        // Clear any invalid data
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
        
        // For 2FA testing
        if (email === 'test@example.com' && password === 'password') {
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
            role: 'admin'
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

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, isAuthenticated }}>
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
