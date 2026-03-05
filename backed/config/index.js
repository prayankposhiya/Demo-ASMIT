/**
 * Central configuration for CRM backend.
 * Loads env via dotenv and exports DB + ZITADEL settings so we have a single
 * place to read env and document why each variable is used.
 */

require('dotenv').config();

module.exports = {
  // Server
  port: process.env.PORT || 3000,

  // MySQL: used by db/connection.js for customers and history tables
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'crm_db',
  },

  // ZITADEL: used by middleware/auth.js to validate JWT (issuer, audience, JWKS URL)
  zitadel: {
    // Strip trailing slash so JWT issuer claim always matches exactly
    issuer: (process.env.ZITADEL_ISSUER || '').replace(/\/$/, ''),
    audience: process.env.ZITADEL_AUDIENCE || '',
  },

  // CORS: allowed origin for frontend (e.g. React dev server)
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
