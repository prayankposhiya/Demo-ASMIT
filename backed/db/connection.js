/**
 * MySQL connection pool for CRM backend.
 * We use a pool so multiple concurrent requests reuse connections instead of
 * opening a new one per request; this improves performance and avoids
 * "too many connections" under load.
 */

const mysql = require('mysql2/promise');
const config = require('../config');

const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

/**
 * Execute a parameterized query (recommended to avoid SQL injection).
 * @param {string} sql - SQL with ? placeholders
 * @param {Array} params - Values for placeholders
 * @returns {Promise<[rows, fields]>} mysql2 result
 */
function query(sql, params = []) {
  console.log(sql, params);
  return pool.query(sql, params);
}

/**
 * Get a connection from the pool (for transactions or multiple statements).
 * Remember to connection.release() when done.
 */
function getConnection() {
  return pool.getConnection();
}

module.exports = { pool, query, getConnection };
