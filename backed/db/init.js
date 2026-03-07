const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');
const config = require('../config');

async function init() {
  const { host, user, password, database } = config.db;
  const conn = await mysql.createConnection({
    host,
    user,
    password,
    multipleStatements: true,
  });
  const schemaPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  await conn.query(sql);
  await conn.end();
  console.log('Database and tables created (or already exist).');
}

init().catch((err) => {
  console.error(err);
  process.exit(1);
});
