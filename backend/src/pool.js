// db.js

/*
  simple database connection pool using mariadb. 
  It reads the database connection details from environment variables defined in .env
*/

import { createPool } from 'mariadb';
import 'dotenv/config';

// check what  app sees:
console.log("DEBUG - DATABASE CREDENTIALS:", {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD ? "PROVIDED" : "EMPTY/MISSING",
  database: process.env.DB_NAME
});

const pool = createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 5
});

export default pool;
