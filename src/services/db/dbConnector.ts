/**
 * Database connector utility to connect to PostgreSQL
 */
import { handleError } from '@/utils/errorHandler';

// Declare global window properties
declare global {
  interface Window {
    DB_CONNECTION_ERROR?: boolean;
    DB_USE_POSTGRES?: boolean;
    USING_POSTGRES?: boolean;
  }
}

// PostgreSQL is always the data source (this function is kept for backwards compatibility)
export const isPostgresEnabled = (): boolean => {
  return true;
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

// Initialize database preferences - now a no-op since we only support PostgreSQL
export const initDatabasePreferences = (): void => {
  console.log('Initializing database preferences - PostgreSQL is now the only supported database');
  // No action needed since we only use PostgreSQL now
  try {
    // Set global flags to indicate PostgreSQL is in use
    window.DB_USE_POSTGRES = true;
    window.USING_POSTGRES = true;
  } catch (error) {
    console.error('Error initializing database preferences:', error);
  }
};

// Utility function to determine the API base URL
export const getApiBaseUrl = (): string => {
  try {
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
    
    // Re-throw the error to be handled by the caller
    throw error;
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
    await executeQuery('/health-check', 'GET');
    console.log('Database connection test successful');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};

// This is now a no-op function since we only support PostgreSQL
// Kept for compatibility with existing code
export const toggleDatabaseSource = (usePostgres: boolean): void => {
  console.log('Database source toggling is no longer supported - PostgreSQL is now the only data source');
  // No-op since we only support PostgreSQL now
  if (!usePostgres) {
    console.warn('Attempted to switch away from PostgreSQL, which is no longer supported');
  }
};
