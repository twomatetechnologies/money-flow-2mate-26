
/**
 * Start script for Bruno API server
 * This file provides an easy way to start the API server for Bruno testing
 */
const app = require('./src/api/bruno-server');

const PORT = process.env.API_PORT || 8081;

// Start the API server
app.listen(PORT, () => {
  console.log(`🚀 Bruno API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  
  if(process.env.POSTGRES_ENABLED === 'true') {
    console.log('PostgreSQL is ENABLED');
    console.log(`Host: ${process.env.POSTGRES_HOST}`);
    console.log(`Database: ${process.env.POSTGRES_DB}`);
  } else {
    console.log('PostgreSQL is DISABLED - using in-memory storage');
  }
  
  console.log('Bruno API Collection available in api-collections/bruno');
});
