
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from 'react';

export interface User {
  name: string;
  email: string;
  has2FAEnabled?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ requires2FA?: boolean }>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isDevelopmentMode: boolean;
  toggleDevelopmentMode: () => void;
  enableTwoFactor: (enable: boolean) => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => ({}),
  logout: () => {},
  updateUser: () => {},
  isDevelopmentMode: false,
  toggleDevelopmentMode: () => {},
  enableTwoFactor: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);

  // Session timeout - auto logout after 30 minutes of inactivity
  const resetSessionTimeout = () => {
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
    }
    
    // Set a new timeout (30 minutes)
    const timeout = setTimeout(() => {
      if (isAuthenticated) {
        // Auto logout
        logout();
        // We would show a toast message here in a real app
        console.log('Session expired due to inactivity');
      }
    }, 30 * 60 * 1000); // 30 minutes
    
    setSessionTimeout(timeout);
  };

  // Track user activity
  useEffect(() => {
    if (isAuthenticated) {
      // Reset the timeout when user is active
      const handleActivity = () => {
        resetSessionTimeout();
      };
      
      // Add event listeners for user activity
      window.addEventListener('mousemove', handleActivity);
      window.addEventListener('keydown', handleActivity);
      window.addEventListener('click', handleActivity);
      
      // Initialize the timeout
      resetSessionTimeout();
      
      return () => {
        // Clean up event listeners and timeout
        window.removeEventListener('mousemove', handleActivity);
        window.removeEventListener('keydown', handleActivity);
        window.removeEventListener('click', handleActivity);
        
        if (sessionTimeout) {
          clearTimeout(sessionTimeout);
        }
      };
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    
    // Load development mode state from localStorage
    const devMode = localStorage.getItem('developmentMode') === 'true';
    setIsDevelopmentMode(devMode);
    
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Check if 2FA is enabled for this user (demo: enable for test@example.com)
    const requires2FA = email.toLowerCase() === 'test@example.com';
    
    // If 2FA is required, return early
    if (requires2FA) {
      // In a real app, we would send a verification code here
      return { requires2FA };
    }
    
    // Normal login flow (no 2FA)
    const fakeUser = {
      name: 'John Doe',
      email: email,
      has2FAEnabled: email.toLowerCase() === 'test@example.com',
    };
    
    setUser(fakeUser);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(fakeUser));
    resetSessionTimeout();
    
    return {};
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    if (sessionTimeout) {
      clearTimeout(sessionTimeout);
      setSessionTimeout(null);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      // Persist the updated user data
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const toggleDevelopmentMode = () => {
    const newMode = !isDevelopmentMode;
    setIsDevelopmentMode(newMode);
    localStorage.setItem('developmentMode', String(newMode));
  };
  
  const enableTwoFactor = (enable: boolean) => {
    if (user) {
      updateUser({ has2FAEnabled: enable });
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    isDevelopmentMode,
    toggleDevelopmentMode,
    enableTwoFactor,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
