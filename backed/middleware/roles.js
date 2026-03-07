function requireRoles(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Forbidden: no role' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

function requireAdmin(req, res, next) {
  return requireRoles(['Admin'])(req, res, next);
}

module.exports = { requireRoles, requireAdmin };
