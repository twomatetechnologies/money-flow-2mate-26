/**
 * SIP Database connector utility - Always uses PostgreSQL
 * This connector bypasses the isPostgresEnabled check
 */
import { getApiBaseUrl, DatabaseError } from './dbConnector';

// Execute a database query via API specifically for SIP operations
export const executeSIPQuery = async <T>(
  endpoint: string, 
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  data?: any
): Promise<T> => {
  try {
    const url = `${getApiBaseUrl()}/api${endpoint}`;
    
    console.log(`SIP API Request: ${method} ${url}`);
    if (data && (method === 'POST' || method === 'PUT')) {
      console.log('Request payload:', JSON.stringify(data, null, 2));
    }
    
    const requestStartTime = performance.now();
    
    const options: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      }
    };
    
    if (data && (method === 'POST' || method === 'PUT')) {
      options.body = JSON.stringify(data);
    }
    
    const response = await fetch(url, options);
    const requestEndTime = performance.now();
    console.log(`API ${method} request to ${url} took ${Math.round(requestEndTime - requestStartTime)}ms`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API error: ${response.status} ${response.statusText}`, errorText);
      throw new DatabaseError(
        `Database operation failed: ${response.status} ${response.statusText}`,
        method,
        endpoint,
        response.status
      );
    }
    
    // Some endpoints may return no content
    if (response.status === 204) {
      return {} as T;
    }
    
    const result = await response.json();
    return result as T;
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }
    console.error(`Database operation failed for ${endpoint}:`, error);
    throw new DatabaseError(
      `Failed to execute ${method} operation on ${endpoint}: ${error instanceof Error ? error.message : String(error)}`,
      method,
      endpoint
    );
  }
};
