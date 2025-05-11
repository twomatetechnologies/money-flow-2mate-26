/**
 * Database connector utility to connect to PostgreSQL
 */
import { handleError } from '@/utils/errorHandler';

// Check if PostgreSQL is enabled
export const isPostgresEnabled = (): boolean => {
  try {
    // For Lovable preview compatibility, check if localStorage is available
    if (typeof window !== 'undefined' && window.localStorage) {
      const postgresEnabled = localStorage.getItem('POSTGRES_ENABLED');
      // Return true if explicitly set to true, otherwise allow localStorage option
      return postgresEnabled === 'true';
    }
    // Default to true in server environments
    return true;
  } catch (error) {
    console.error('Error checking PostgreSQL status:', error);
    return false; // Default to localStorage if there's an error
  }
};

// Check if database connection has an error
export const hasConnectionError = (): boolean => {
  try {
    return window.DB_CONNECTION_ERROR === true;
  } catch (error) {
    console.error('Error checking database connection status:', error);
    return true; // Assume error in case of issues
  }
};

// Utility function to determine the API base URL
export const getApiBaseUrl = (): string => {
  try {
    // Check if there's a custom API base URL in settings
    if (typeof window !== 'undefined' && window.localStorage) {
      const settings = localStorage.getItem('finance-app-settings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        if (parsedSettings && parsedSettings.apiBaseUrl) {
          return parsedSettings.apiBaseUrl;
        }
      }
    }
    // In development, use relative URL to leverage Vite's proxy
    return '';
  } catch (error) {
    console.error('Error getting API base URL:', error);
    return '';
  }
};

// Custom error for database operations
export class DatabaseError extends Error {
  statusCode: number;
  operation: string;
  endpoint: string;
  
  constructor(message: string, operation: string, endpoint: string, statusCode: number = 500) {
    super(message);
    this.name = 'DatabaseError';
    this.statusCode = statusCode;
    this.operation = operation;
    this.endpoint = endpoint;
  }
}

// Execute a database query via API
export const executeQuery = async <T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<T> => {
  try {
    // Check if we should use localStorage instead of API
    if (!isPostgresEnabled()) {
      console.log('Using localStorage for data persistence instead of API');
      throw new DatabaseError('PostgreSQL disabled, using localStorage', method, endpoint);
    }

    const url = `${getApiBaseUrl()}/api${endpoint}`;
    
    console.log(`API Request: ${method} ${url}`);
    if (data && (method === 'POST' || method === 'PUT')) {
      console.log('Request payload:', JSON.stringify(data, null, 2));
    }
    
    const requestStartTime = performance.now();
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      credentials: 'include', // Include cookies for authentication
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    const requestDuration = performance.now() - requestStartTime;
    
    // Log performance metrics for slow requests
    if (requestDuration > 1000) { // Log if request took more than 1s
      console.warn(`Slow API request: ${method} ${url} took ${requestDuration.toFixed(2)}ms`);
    }
    
    if (!response.ok) {
      // Try to parse error response if possible
      let errorDetail: string;
      try {
        const errorBody = await response.json();
        errorDetail = errorBody.error?.message || errorBody.error || JSON.stringify(errorBody);
      } catch {
        errorDetail = await response.text() || response.statusText;
      }
      
      const errorMessage = `Database operation failed (${response.status}): ${errorDetail}`;
      throw new DatabaseError(
        errorMessage, 
        method, 
        endpoint, 
        response.status
      );
    }
    
    const responseData = await response.json();
    return responseData;
  } catch (error) {
    // Log the error
    if (error instanceof DatabaseError) {
      console.error(`DB Error (${error.statusCode}):`, error.message);
    } else {
      console.error('Database query error:', error);
    }
    
    // For Lovable preview, fallback to localStorage
    console.log('Falling back to in-memory storage for Lovable preview');
    throw error;
  }
};

// Initialize database connection preferences in localStorage
export const initDatabasePreferences = (): void => {
  try {
    // For Lovable preview, default to localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('POSTGRES_ENABLED', 'false');
      
      // Set window variable too if it exists
      if (typeof window !== 'undefined') {
        window.POSTGRES_ENABLED = false;
      }
    }
  } catch (error) {
    console.error('Error initializing database preferences:', error);
  }
};

// Toggle database source between PostgreSQL and localStorage
export const toggleDatabaseSource = (usePostgres: boolean): void => {
  try {
    localStorage.setItem('POSTGRES_ENABLED', usePostgres ? 'true' : 'false');
    
    if (typeof window !== 'undefined') {
      window.POSTGRES_ENABLED = usePostgres;
    }
    
    // Reload to apply changes
    window.location.reload();
  } catch (error) {
    console.error('Error toggling database source:', error);
    handleError(error, 'Failed to toggle database source');
  }
};

// Get pgAdmin URL for database administration
export const getPgAdminUrl = (): string => {
  // Use the same host but with pgAdmin port
  const host = window.location.hostname;
  return `http://${host}:5050`;
};

// Function to test database connection
export const testDatabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing database connection...');
    
    // For Lovable preview, skip actual testing
    if (!isPostgresEnabled()) {
      console.log('PostgreSQL disabled, skipping connection test');
      return false;
    }
    
    await executeQuery('/health-check', 'GET');
    console.log('Database connection test successful');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};
