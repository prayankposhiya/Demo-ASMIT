require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  db: {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'crm_db',
  },
  zitadel: {
    issuer: (process.env.ZITADEL_ISSUER || '').replace(/\/$/, ''),
    audience: process.env.ZITADEL_AUDIENCE || '',
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
};
