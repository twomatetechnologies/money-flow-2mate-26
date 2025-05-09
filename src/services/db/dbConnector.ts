
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

// Check if database connection has an error
export const hasConnectionError = (): boolean => {
  try {
    return window.DB_CONNECTION_ERROR === true;
  } catch (error) {
    console.error('Error checking database connection status:', error);
    return false;
  }
};

// Utility function to determine the API base URL
export const getApiBaseUrl = (): string => {
  // In development, use relative URL to leverage Vite's proxy
  return '';
};

// Execute a database query via API
export const executeQuery = async <T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<T> => {
  try {
    const url = `${getApiBaseUrl()}/api${endpoint}`;
    
    console.log(`API Request: ${method} ${url}`);
    
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
      console.error(`API Error (${response.status}): ${errorText}`);
      throw new Error(`Database query failed: ${response.status} - ${errorText || response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Initialize database connection preferences in localStorage
export const initDatabasePreferences = (): void => {
  try {
    // Only set if not already set
    if (localStorage.getItem('POSTGRES_ENABLED') === null && 
        typeof window.POSTGRES_ENABLED !== 'undefined') {
      localStorage.setItem('POSTGRES_ENABLED', window.POSTGRES_ENABLED ? 'true' : 'false');
    }
  } catch (error) {
    console.error('Error initializing database preferences:', error);
  }
};

// Toggle database source between PostgreSQL and localStorage
export const toggleDatabaseSource = (usePostgres: boolean): void => {
  try {
    localStorage.setItem('POSTGRES_ENABLED', usePostgres ? 'true' : 'false');
    // Reload the application to apply changes
    window.location.reload();
  } catch (error) {
    console.error('Error toggling database source:', error);
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
    await executeQuery('/health-check', 'GET');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
};
