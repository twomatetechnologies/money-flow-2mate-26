
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

// Request logging
app.use(morgan('dev'));

// Parse JSON request body
app.use(express.json());

// API routes
app.use('/api', routes);

// Health check endpoint
app.get('/api/health-check', (_req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error handling middleware
app.use((err, _req, res, _next) => {
  console.error('API Error:', err);
  res.status(500).json({ 
    error: err.message || 'Internal server error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined 
  });
});

// Only start the server if this file is run directly
if (require.main === module) {
  const PORT = process.env.API_PORT || 8081;
  app.listen(PORT, () => {
    console.log(`API server running on port ${PORT}`);
  });
}

module.exports = app;
