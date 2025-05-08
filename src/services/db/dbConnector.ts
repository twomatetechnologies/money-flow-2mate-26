
/**
 * Database connector utility to connect to PostgreSQL
 */

// Check if PostgreSQL is enabled via environment variable
export const isPostgresEnabled = (): boolean => {
  try {
    // First check localStorage (set during app initialization)
    const storedValue = localStorage.getItem('POSTGRES_ENABLED');
    if (storedValue !== null) {
      return storedValue === 'true';
    }
    
    // Fall back to window variable if available
    if (typeof window.POSTGRES_ENABLED !== 'undefined') {
      return window.POSTGRES_ENABLED === true;
    }
    
    // Default to false if neither is available
    return false;
  } catch (error) {
    console.error('Error checking PostgreSQL status:', error);
    return false;
  }
};

// Utility function to determine the API base URL
export const getApiBaseUrl = (): string => {
  // In production, API calls go to the same host
  return window.location.origin;
};

// Execute a database query via API
export const executeQuery = async <T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<T> => {
  try {
    const url = `${getApiBaseUrl()}/api${endpoint}`;
    
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
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Database query failed: ${errorText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};
