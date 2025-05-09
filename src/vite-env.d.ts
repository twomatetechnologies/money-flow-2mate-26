
/// <reference types="vite/client" />

interface Window {
  POSTGRES_ENABLED?: boolean;
  DB_SIZE?: string;
  DB_CONNECTION_ERROR?: boolean;
  trackError?: (message: string, context?: Record<string, any>) => void;
}
