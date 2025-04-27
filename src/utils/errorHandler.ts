
import { toast } from "@/hooks/use-toast";

type ErrorOptions = {
  title?: string;
  showToast?: boolean;
  logToConsole?: boolean;
};

const defaultOptions: ErrorOptions = {
  title: "An error occurred",
  showToast: true,
  logToConsole: true
};

export function handleError(error: unknown, message?: string, options: ErrorOptions = {}) {
  const opts = { ...defaultOptions, ...options };
  const errorMessage = extractErrorMessage(error, message);
  
  if (opts.logToConsole) {
    console.error(errorMessage, error);
  }
  
  if (opts.showToast) {
    toast({
      title: opts.title,
      description: errorMessage,
      variant: "destructive"
    });
  }
  
  return errorMessage;
}

function extractErrorMessage(error: unknown, fallbackMessage?: string): string {
  if (typeof error === 'string') return error;
  
  if (error instanceof Error) return error.message;
  
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
    return error.message;
  }
  
  return fallbackMessage || "An unexpected error occurred";
}

export function createErrorBoundary<T>(promise: Promise<T>, errorMessage?: string): Promise<T> {
  return promise.catch(error => {
    handleError(error, errorMessage);
    throw error; // Re-throw to allow caller to handle if needed
  });
}

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
