
/**
 * Simple Express server for local development
 */
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { v4 as uuidv4 } from 'uuid';
import pg from 'pg';
import routes from './routes.js';

// Create Express server
const app = express();

// Database connection
let dbClient = null;
let dbConnected = false;

// Import the users array
import { users } from './users.js';

// Initialize PostgreSQL connection if enabled
const initializeDatabase = async () => {
  if (process.env.POSTGRES_ENABLED === 'true') {
    try {
      const { Pool } = pg;
      
      const pool = new Pool({
        user: process.env.POSTGRES_USER || 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        database: process.env.POSTGRES_DB || 'financeapp',
        password: process.env.POSTGRES_PASSWORD || 'postgres123',
        port: parseInt(process.env.POSTGRES_PORT || '5432'),
      });

      // Test the connection
      const client = await pool.connect();
      console.log('✅ PostgreSQL database connected successfully');
      client.release();
      
      dbClient = pool;
      dbConnected = true;
      
      // Attach the database client to the app for route handlers to use
      app.locals.db = pool;
      
      return pool;
    } catch (error) {
      console.error('❌ Failed to connect to PostgreSQL:', error);
      console.error('Falling back to in-memory storage');
      dbConnected = false;
      return null;
    }
  } else {
    console.log('PostgreSQL is DISABLED - using in-memory storage');
    return null;
  }
};

// Make the users array available to all routes
app.locals.users = users;
console.log('INITIALIZING SERVER WITH USERS:', { count: users.length, userEmails: users.map(u => u.email) });

// Health check endpoint
app.get('/api/health-check', async (req, res) => {
  try {
    // Check database connection if PostgreSQL is enabled
    if (process.env.POSTGRES_ENABLED === 'true') {
      if (dbConnected && dbClient) {
        const result = await dbClient.query('SELECT NOW()');
        res.json({ 
          status: 'OK', 
          timestamp: result.rows[0].now,
          postgres: true,
          env: process.env.NODE_ENV,
          dbHost: process.env.POSTGRES_HOST,
          dbName: process.env.POSTGRES_DB
        });
      } else {
        res.status(500).json({ 
          status: 'ERROR', 
          timestamp: new Date(),
          error: 'Database connection failed' 
        });
      }
    } else {
      // In-memory mode
      res.json({ 
        status: 'OK', 
        timestamp: new Date(),
        postgres: false,
        env: process.env.NODE_ENV
      });
    }
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date(),
      error: error.message 
    });
  }
});

// Enable CORS for all routes with proper options
app.use(cors({
  origin: true, // Allow all origins in development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Request logging - use 'combined' format for more details in production
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Add request ID and timing
app.use((req, res, next) => {
  req.id = uuidv4();
  req.startTime = Date.now();
  
  // Log response details after the request is complete
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    console.log(`[${req.id}] ${req.method} ${req.path} >> ${res.statusCode} (${duration}ms)`);
  });
  
  next();
});

// Debug middleware to log request details
app.use((req, _res, next) => {
  console.log(`\n[DEBUG] ${req.method} ${req.path}`);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Parse JSON request body
app.use(express.json());

// Explicitly set content type for API routes
app.use((req, res, next) => {
  // Set for API routes only
  if (req.path.startsWith('/api')) {
    res.setHeader('Content-Type', 'application/json');
  }
  next();
});

// Health check endpoint with database verification
app.get('/api/health-check', async (_req, res) => {
  try {
    // Check database connection by making a simple query
    const timestamp = new Date();
    res.json({ 
      status: 'OK', 
      timestamp,
      postgres: true,
      env: process.env.NODE_ENV,
      dbHost: process.env.POSTGRES_HOST,
      dbName: process.env.POSTGRES_DB
    });
  } catch (error) {
    console.error('Health check failed:', error);
    res.status(500).json({ 
      status: 'ERROR', 
      timestamp: new Date(),
      error: error.message 
    });
  }
});

// Mount API routes under /api prefix
app.use('/api', routes);

// Custom error types
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

class NotFoundError extends Error {
  constructor(resource) {
    super(`${resource} not found`);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class AuthorizationError extends Error {
  constructor(message) {
    super(message || 'Not authorized');
    this.name = 'AuthorizationError';
    this.statusCode = 401;
  }
}

// Remove the middleware that forces PostgreSQL
// This allows the app to work with localStorage in development
// and in the Lovable preview

// 404 handler for undefined routes
app.use((req, res, next) => {
  const error = new NotFoundError(`Route ${req.method} ${req.originalUrl}`);
  next(error);
});

// Error handling middleware
app.use((err, req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const errorResponse = { 
    error: {
      message: err.message || 'Internal server error',
      type: err.name || 'Error',
      path: req.path,
      method: req.method,
      timestamp: new Date().toISOString(),
      requestId: req.id // Add request ID for tracking
    }
  };
  
  // Log error details
  console.error(`[${req.id}] ${req.method} ${req.path} >> ERROR (${statusCode}):`, err.message);
  
  // Only include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Stack:', err.stack);
    errorResponse.error.stack = err.stack;
  }
  
  res.status(statusCode).json(errorResponse);
});

// Export error classes for use in route handlers
app.ValidationError = ValidationError;
app.NotFoundError = NotFoundError;
app.AuthorizationError = AuthorizationError;

// Initialize the database connection
initializeDatabase().then(() => {
  console.log('Database initialization complete');
}).catch(err => {
  console.error('Failed to initialize database:', err);
});

// Only start the server if this file is run directly
// Start server if this file is run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const PORT = process.env.API_PORT || 8081;
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`PostgreSQL is ${process.env.POSTGRES_ENABLED === 'true' ? 'ENABLED' : 'DISABLED - using in-memory storage'}`);
  });
}

export { app };
