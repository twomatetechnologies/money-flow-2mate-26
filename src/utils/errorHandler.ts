
import { toast } from "@/hooks/use-toast";

// Error types
type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

type ErrorOptions = {
  title?: string;
  showToast?: boolean;
  logToConsole?: boolean;
  severity?: ErrorSeverity;
  context?: Record<string, any>;
  retry?: () => Promise<any>;
  fallback?: any;
};

const defaultOptions: ErrorOptions = {
  title: "An error occurred",
  showToast: true,
  logToConsole: true,
  severity: 'medium'
};

// Helper to format objects for logging
const formatErrorObject = (obj: any): string => {
  if (!obj) return 'null';
  if (typeof obj !== 'object') return String(obj);
  
  try {
    return JSON.stringify(obj, (key, value) => {
      if (value instanceof Error) {
        return {
          name: value.name,
          message: value.message,
          stack: value.stack,
        };
      }
      return value;
    }, 2);
  } catch (e) {
    return String(obj);
  }
};

// Main error handler function
export function handleError(error: unknown, message?: string, options: ErrorOptions = {}) {
  const opts = { ...defaultOptions, ...options };
  const errorMessage = extractErrorMessage(error, message);
  const timestamp = new Date().toISOString();
  
  // Build structured error log
  const logData = {
    timestamp,
    message: errorMessage,
    severity: opts.severity,
    context: opts.context || {},
    originalError: error
  };
  
  if (opts.logToConsole) {
    const logMethod = opts.severity === 'critical' || opts.severity === 'high' 
      ? console.error 
      : opts.severity === 'medium' ? console.warn : console.info;
    
    logMethod(
      `[${timestamp}] [${opts.severity?.toUpperCase()}] ${errorMessage}`, 
      error instanceof Error ? error : formatErrorObject(error),
      opts.context ? `\nContext: ${formatErrorObject(opts.context)}` : ''
    );
  }
  
  // Show toast notification if enabled
  if (opts.showToast) {
    const variant = opts.severity === 'critical' || opts.severity === 'high' 
      ? "destructive" 
      : "default";
      
    toast({
      title: opts.title,
      description: errorMessage,
      variant
    });
  }
  
  // Track errors if available
  if (typeof window !== 'undefined' && typeof window.trackError === 'function') {
    try {
      window.trackError(errorMessage, { 
        severity: opts.severity,
        context: opts.context
      });
    } catch (e) {
      console.error('Error tracking failed:', e);
    }
  }
  
  return errorMessage;
}

// Extract a readable message from different error types
function extractErrorMessage(error: unknown, fallbackMessage?: string): string {
  // Handle string errors
  if (typeof error === 'string') return error;
  
  // Handle Error objects
  if (error instanceof Error) return error.message;
  
  // Handle objects with message property
  if (error && typeof error === 'object') {
    // Check for API error responses
    if ('response' in error && error.response) {
      // Axios-like errors
      const resp = (error as any).response;
      if (resp.data && resp.data.message) {
        return resp.data.message;
      }
      if (resp.data && resp.data.error) {
        return typeof resp.data.error === 'string' ? resp.data.error : 'API error';
      }
      return `Server error: ${resp.status}`;
    }
    
    // Check for message property
    if ('message' in error && typeof (error as any).message === 'string') {
      return (error as any).message;
    }
    
    // Check for error property (nested errors)
    if ('error' in error && error.error) {
      if (typeof (error as any).error === 'string') {
        return (error as any).error;
      }
      if (typeof (error as any).error === 'object' && 'message' in (error as any).error) {
        return (error as any).error.message;
      }
    }
  }
  
  return fallbackMessage || "An unexpected error occurred";
}

// Helper to create boundaries around async operations
export function createErrorBoundary<T>(
  promise: Promise<T>, 
  errorMessage?: string,
  options?: ErrorOptions
): Promise<T> {
  return promise.catch(error => {
    handleError(error, errorMessage, options);
    throw error; // Re-throw to allow caller to handle if needed
  });
}

// Helper to retry operations with exponential backoff
export async function retryOperation<T>(
  operation: () => Promise<T>,
  retries = 3,
  delay = 1000,
  backoffFactor = 2
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    
    console.warn(`Operation failed, retrying in ${delay}ms... (${retries} attempts left)`, error);
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryOperation(operation, retries - 1, delay * backoffFactor, backoffFactor);
  }
}

// Custom error types
export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class AuthenticationError extends Error {
  constructor(message: string = "Authentication failed") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class NetworkError extends Error {
  constructor(message: string = "Network connection failed") {
    super(message);
    this.name = "NetworkError";
  }
}

export class ResourceNotFoundError extends Error {
  constructor(resource: string) {
    super(`Resource not found: ${resource}`);
    this.name = "ResourceNotFoundError";
  }
}

export class BusinessLogicError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BusinessLogicError";
  }
}

// Create a typed wrapper for common error handling
export function withErrorHandling<T extends (...args: any[]) => Promise<any>>(
  fn: T, 
  errorMessage: string,
  options?: ErrorOptions
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, errorMessage, options);
      throw error;
    }
  }) as T;
}
