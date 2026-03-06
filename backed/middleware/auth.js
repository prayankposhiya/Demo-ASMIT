/**
 * JWT authentication middleware for ZITADEL OIDC.
 * Validates Bearer token: signature (via JWKS), issuer, and audience.
 * Attaches req.user = { sub, role } for use in routes.
 * We use JWKS so we don't need a shared secret; ZITADEL rotates keys and we fetch
 * the public key by kid from the issuer's well-known JWKS endpoint.
 */

const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const config = require('../config');

// JWKS client: fetches and caches public keys from ZITADEL issuer
// Zitadel's JWKS endpoint is /oauth/v2/keys (NOT /.well-known/jwks.json)
// We validate iss and aud in verify() so tokens from other issuers are rejected
const client = jwksClient({
  jwksUri: `${config.zitadel.issuer.replace(/\/$/, '')}/oauth/v2/keys`,
  cache: true,
  rateLimit: true,
  cacheMaxAge: 600000, // 10 min
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key?.getPublicKey?.() || key?.publicKey || key?.rsaPublicKey;
    callback(null, signingKey);
  });
}

/**
 * Normalize ZITADEL role claim to Admin | Staff.
 * ZITADEL uses urn:zitadel:iam:org:project:roles; format can be array of strings
 * (e.g. ["orgId:Admin"]) or objects. We map to "Admin" or "Staff" per TASKOVERVIEW.
 * Admin takes precedence if user has both.
 */
function normalizeRole(claims) {
  const rolesClaim = claims['urn:zitadel:iam:org:project:roles'];
  if (!rolesClaim) return null;

  // Zitadel actual format: { "Admin": { "<orgId>": "<orgDomain>" }, ... }
  if (typeof rolesClaim === 'object' && !Array.isArray(rolesClaim)) {
    if ('admin' in rolesClaim) return 'Admin';
    if ('staff' in rolesClaim) return 'Staff';
    return null;
  }

  // Fallback: array of strings format
  const roles = Array.isArray(rolesClaim) ? rolesClaim : [rolesClaim];
  let hasAdmin = false;
  let hasStaff = false;
  for (const r of roles) {
    const key = typeof r === 'string' ? r.split(':').pop() : r?.key;
    if (key === 'Admin') hasAdmin = true;
    if (key === 'Staff') hasStaff = true;
  }
  if (hasAdmin) return 'Admin';
  if (hasStaff) return 'Staff';
  return null;
}

/**
 * Require valid JWT in Authorization: Bearer <token>.
 * On success: req.user = { sub, role }; next().
 * On failure: 401 JSON response.
 */
function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' });
  }
  const token = auth.slice(7);

  jwt.verify(token, getKey, {
    algorithms: ['RS256'],
    issuer: config.zitadel.issuer,
    audience: config.zitadel.audience,
    ignoreExpiration: false,
  }, (err, decoded) => {
    if (err) {
      return res.status(401).json({ error: 'Invalid or expired token', detail: err.message });
    }
    console.log(decoded, normalizeRole(decoded), "decoded");
    req.user = {
      sub: decoded.sub,
      role: normalizeRole(decoded) || null,
    };
    next();
  });
}

module.exports = { requireAuth, normalizeRole };
