const mysql = require('mysql2/promise');
const config = require('../config');
const fs = require('fs');

const pool = mysql.createPool({
  host: config.db.host,
  user: config.db.user,
  password: config.db.password,
  database: config.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    ca: fs.readFileSync("./db/ca-cert_03032026.pem"),
    rejectUnauthorized: false
  }
});
function query(sql, params = []) {
  return pool.query(sql, params);
}

module.exports = { pool, query };
