
/**
 * Simple Express server for local development
 */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');

// Create Express server
const app = express();

// Enable CORS for all routes
app.use(cors());

// Request logging - use 'combined' format for more details in production
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Parse JSON request body
app.use(express.json());

// API routes
app.use('/api', routes);

// Health check endpoint
app.get('/api/health-check', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

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
      timestamp: new Date().toISOString()
    }
  };
  
  // Log details based on severity
  if (statusCode >= 500) {
    console.error(`[${req.method}] ${req.path} >> ERROR (${statusCode}):`, err);
    console.error('Stack:', err.stack);
    
    // Only include stack trace in development
    if (process.env.NODE_ENV === 'development') {
      errorResponse.error.stack = err.stack;
    }
  } else {
    console.warn(`[${req.method}] ${req.path} >> WARN (${statusCode}):`, err.message);
  }
  
  res.status(statusCode).json(errorResponse);
});

// Export error classes for use in route handlers
app.ValidationError = ValidationError;
app.NotFoundError = NotFoundError;
app.AuthorizationError = AuthorizationError;

// Only start the server if this file is run directly
if (require.main === module) {
  const PORT = process.env.API_PORT || 8081;
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

module.exports = app;
