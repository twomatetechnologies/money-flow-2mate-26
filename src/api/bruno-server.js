
/**
 * Bruno API testing server configuration
 * This file provides an easy way to start the API server for Bruno testing
 */
const app = require('./server');

const PORT = process.env.BRUNO_API_PORT || 8081;

// Start the API server
app.listen(PORT, () => {
  console.log(`🚀 Bruno API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log('PostgreSQL is ENABLED and required');
  console.log('Bruno API Collection available in api-collections/bruno');
});
