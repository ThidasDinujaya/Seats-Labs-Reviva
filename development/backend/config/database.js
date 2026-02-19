// ============================================================
// config/database.js
// PURPOSE: Creates a connection pool to PostgreSQL database.
// LOGIC: Uses the 'pg' library's Pool class which manages
//        multiple database connections efficiently.
//        Environment variables store sensitive credentials.
// ============================================================

const { Pool } = require('pg');   // Import Pool from pg library
require('dotenv').config();       // Load .env variables

// Create a pool of database connections
// THINKING: A pool reuses connections instead of creating new ones
// each time, which is much faster for a web server handling
// many requests simultaneously.
const pool = new Pool({
  host: process.env.DB_HOST,         // Database server address
  port: process.env.DB_PORT,         // PostgreSQL default port: 5432
  database: process.env.DB_NAME,     // Our database name: seatslabs
  user: process.env.DB_USER,         // Database username
  password: process.env.DB_PASSWORD  // Database password
});

// Test the connection when server starts
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

// Handle connection errors
pool.on('error', (error) => {
  console.error('Database connection error:', error);
});

// Export the pool so other files can use it to query the database
module.exports = pool;