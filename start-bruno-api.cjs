
/**
 * Start script for Bruno API server
 * This file provides an easy way to start the API server for Bruno testing
 */
async function startServer() {
  try {
    // Set PostgreSQL as enabled for API server
    process.env.POSTGRES_ENABLED = 'true';
    process.env.POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
    process.env.POSTGRES_DB = process.env.POSTGRES_DB || 'financeapp';
    process.env.POSTGRES_USER = process.env.POSTGRES_USER || 'postgres';
    process.env.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'postgres123';
    process.env.POSTGRES_PORT = process.env.POSTGRES_PORT || '5432';
    
    const { app } = await import('./src/api/bruno-server.js');
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
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
