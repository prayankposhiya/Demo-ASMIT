const jwt = require('jsonwebtoken');
const jwksClient = require('jwks-rsa');
const config = require('../config');

const client = jwksClient({
  jwksUri: `${config.zitadel.issuer.replace(/\/$/, '')}/oauth/v2/keys`,
  cache: true,
  rateLimit: true,
  cacheMaxAge: 600000,
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) return callback(err);
    const signingKey = key?.getPublicKey?.() || key?.publicKey || key?.rsaPublicKey;
    callback(null, signingKey);
  });
}


function normalizeRole(claims) {
  const rolesClaim = claims['urn:zitadel:iam:org:project:roles'];
  if (!rolesClaim) return null;

  if (typeof rolesClaim === 'object' && !Array.isArray(rolesClaim)) {
    if ('admin' in rolesClaim) return 'Admin';
    if ('staff' in rolesClaim) return 'Staff';
    return null;
  }

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
