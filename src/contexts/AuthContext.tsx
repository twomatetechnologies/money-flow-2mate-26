
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
} from 'react';
import * as userService from '../services/userService';
import { User as UserType } from '@/types/user';
import { toast } from 'sonner';

interface AuthContextType {
  user: UserType | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ requires2FA?: boolean }>;
  logout: () => void;
  updateUser: (userData: Partial<UserType>) => void;
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

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<UserType | null>(null);
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
        toast.warning('Session expired due to inactivity');
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
    const loadUser = async () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          // Verify this user still exists in our system
          const userExists = await userService.getUserByEmail(userData.email);
          
          if (userExists) {
            setUser(userData);
            setIsAuthenticated(true);
          } else {
            // User no longer exists in system, clear local storage
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Error parsing stored user:', error);
          localStorage.removeItem('user');
        }
      }
      
      // Load development mode state from localStorage
      const devMode = localStorage.getItem('developmentMode') === 'true';
      setIsDevelopmentMode(devMode);
      
      setLoading(false);
    };
    
    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Find user by email
      const foundUser = await userService.getUserByEmail(email);
      
      // This is a simplified auth flow for demo purposes
      // In a real app, we would verify the password
      if (!foundUser) {
        // Demo mode - create a fake user if not found
        console.log('User not found, creating demo user');
        
        // Check if 2FA is enabled for this user (demo: enable for test@example.com)
        const requires2FA = email.toLowerCase() === 'test@example.com';
        
        // If 2FA is required, return early
        if (requires2FA) {
          // In a real app, we would send a verification code here
          return { requires2FA };
        }
        
        // Normal login flow (no 2FA)
        const createdUser = await userService.createUser({
          name: email.split('@')[0],
          email,
          password, // In a real app this would be hashed
          role: 'user',
          has2FAEnabled: email.toLowerCase() === 'test@example.com',
          settings: {
            darkMode: false,
            notifications: true
          }
        });
        
        setUser(createdUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(createdUser));
        
        // Update last login time
        await userService.updateUser(createdUser.id, {
          lastLogin: new Date()
        });
        
        resetSessionTimeout();
        return {};
      } else {
        // Check if 2FA is required
        if (foundUser.has2FAEnabled) {
          return { requires2FA: true };
        }
        
        // Normal login
        setUser(foundUser);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(foundUser));
        
        // Update last login time
        await userService.updateUser(foundUser.id, {
          lastLogin: new Date()
        });
        
        resetSessionTimeout();
        return {};
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      throw error;
    }
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

  const updateUser = async (userData: Partial<UserType>) => {
    try {
      if (user) {
        const updatedUser = await userService.updateUser(user.id, userData);
        if (updatedUser) {
          setUser(updatedUser);
          // Persist the updated user data
          localStorage.setItem('user', JSON.stringify(updatedUser));
          toast.success('Profile updated successfully');
        }
      }
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update profile');
    }
  };

  const toggleDevelopmentMode = () => {
    const newMode = !isDevelopmentMode;
    setIsDevelopmentMode(newMode);
    localStorage.setItem('developmentMode', String(newMode));
  };
  
  const enableTwoFactor = async (enable: boolean) => {
    try {
      if (user) {
        await updateUser({ has2FAEnabled: enable });
        toast.success(`Two-factor authentication ${enable ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.error('Error updating 2FA settings:', error);
      toast.error(`Failed to ${enable ? 'enable' : 'disable'} two-factor authentication`);
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
