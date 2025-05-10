
/**
 * Helper script to start the Bruno API server
 */
require('dotenv').config(); // Load environment variables

// Set PostgreSQL environment variables
process.env.POSTGRES_ENABLED = 'true';
process.env.POSTGRES_HOST = process.env.POSTGRES_HOST || 'localhost';
process.env.POSTGRES_PORT = process.env.POSTGRES_PORT || 5432;
process.env.POSTGRES_DB = process.env.POSTGRES_DB || 'financeapp';
process.env.POSTGRES_USER = process.env.POSTGRES_USER || 'postgres';
process.env.POSTGRES_PASSWORD = process.env.POSTGRES_PASSWORD || 'postgres123';

// Set Bruno-specific port
process.env.BRUNO_API_PORT = process.env.BRUNO_API_PORT || 8081;

// Start the server
require('./src/api/bruno-server.js');

