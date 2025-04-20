
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
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isDevelopmentMode: boolean; // Added missing property
  toggleDevelopmentMode: () => void; // Added missing property
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  logout: () => {},
  updateUser: () => {},
  isDevelopmentMode: false, // Initialize with default value
  toggleDevelopmentMode: () => {}, // Initialize with empty function
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDevelopmentMode, setIsDevelopmentMode] = useState(false); // Added state for development mode

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
    // Simulate successful login
    const fakeUser = {
      name: 'John Doe',
      email: email,
    };
    setUser(fakeUser);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(fakeUser));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
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

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
    isDevelopmentMode,
    toggleDevelopmentMode,
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
