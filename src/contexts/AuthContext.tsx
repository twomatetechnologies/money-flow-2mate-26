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
  login: (email: string, password: string) => Promise<{ success: boolean; requires2FA?: boolean; errorMessage?: string }>;
  verify2FA: (code: string) => Promise<{ success: boolean; errorMessage?: string }>;
  resend2FACode: (email: string) => Promise<{ success: boolean; errorMessage?: string }>;
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

  const login = async (email: string, password: string): Promise<{ success: boolean; requires2FA?: boolean; errorMessage?: string }> => {
    try {
      setIsLoading(true);
      
      // Basic validation before API call
      if (!email || !password) {
        return { 
          success: false, 
          errorMessage: "Please provide both email and password" 
        };
      }
      
      // Call the login API endpoint
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      // If the request failed, extract error message and return failure
      if (!response.ok) {
        let errorMessage = "Login failed";
        
        try {
          // Try to parse error response as JSON
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // If parsing fails, use text content
          errorMessage = await response.text();
        }
        
        // Map HTTP status codes to more user-friendly messages
        if (response.status === 401) {
          errorMessage = "Invalid email or password. Please check your credentials and try again.";
        } else if (response.status === 429) {
          errorMessage = "Too many login attempts. Please try again later.";
        } else if (response.status >= 500) {
          errorMessage = "Server error. Please try again later or contact support.";
        }
        
        console.error("Login failed:", errorMessage);
        return { success: false, errorMessage };
      }

      // Parse the response
      const data = await response.json();
      
      // Check if 2FA is required
      if (data.requiresTwoFactor) {
        // Store the token for 2FA verification
        localStorage.setItem('auth_temp_token', data.token);
        
        // If user information is available, store it too
        if (data.user) {
          localStorage.setItem('auth_temp_user', JSON.stringify(data.user));
        }
        
        return { success: true, requires2FA: true };
      }
      
      // Store user and token data
      setUser(data.user);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      localStorage.setItem('auth_token', data.token);
      
      return { success: true };
    } catch (error) {
      console.error("Error during login:", error);
      return { 
        success: false, 
        errorMessage: error instanceof Error ? error.message : "An unexpected error occurred"
      };
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

  // Add new method to verify 2FA codes
  const verify2FA = async (code: string): Promise<{ success: boolean; errorMessage?: string }> => {
    try {
      setIsLoading(true);
      const tempToken = localStorage.getItem('auth_temp_token');
      
      if (!tempToken) {
        return { 
          success: false, 
          errorMessage: "Authentication session expired. Please login again." 
        };
      }
      
      // Call the verify 2FA API endpoint
      const response = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code, token: tempToken })
      });
      
      if (!response.ok) {
        let errorMessage = "Verification failed";
        
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          errorMessage = await response.text();
        }
        
        console.error("2FA verification failed:", errorMessage);
        return { success: false, errorMessage };
      }
      
      // Parse the response
      const data = await response.json();
      
      if (data.success) {
        // Store the new token and user data
        localStorage.setItem('auth_token', data.token);
        localStorage.removeItem('auth_temp_token');
        
        // If user data comes back with the verification response, update it
        if (data.user) {
          setUser(data.user);
          localStorage.setItem('auth_user', JSON.stringify(data.user));
        }
        
        return { success: true };
      } else {
        return { 
          success: false, 
          errorMessage: data.errorMessage || "Verification failed. Please try again." 
        };
      }
    } catch (error) {
      console.error("Error during 2FA verification:", error);
      return { 
        success: false, 
        errorMessage: error instanceof Error ? error.message : "An unexpected error occurred" 
      };
    } finally {
      setIsLoading(false);
    }
  };

  // Add method to resend 2FA code
  const resend2FACode = async (email: string): Promise<{ success: boolean; errorMessage?: string }> => {
    try {
      setIsLoading(true);
      
      // Call the resend 2FA code API endpoint
      const response = await fetch('/api/auth/resend-2fa', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      if (!response.ok) {
        let errorMessage = "Failed to resend verification code";
        
        try {
          const errorData = await response.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          errorMessage = await response.text();
        }
        
        console.error("Resend 2FA code failed:", errorMessage);
        return { success: false, errorMessage };
      }
      
      // Parse the response
      const data = await response.json();
      
      // Get the new token and save it
      if (data.token) {
        localStorage.setItem('auth_temp_token', data.token);
      }
      
      return { success: true };
    } catch (error) {
      console.error("Error during 2FA code resend:", error);
      return { 
        success: false, 
        errorMessage: error instanceof Error ? error.message : "An unexpected error occurred" 
      };
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isLoading, 
      login, 
      logout, 
      isAuthenticated, 
      updateUser, 
      isDevelopmentMode,
      verify2FA,
      resend2FACode
    }}>
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
