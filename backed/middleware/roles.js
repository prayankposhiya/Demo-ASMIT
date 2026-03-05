/**
 * Role-based access middleware.
 * Use after requireAuth to restrict routes by req.user.role (Admin | Staff).
 */

/**
 * Require one of the given roles. Call after requireAuth.
 * Returns 403 JSON if req.user.role is not in allowedRoles.
 */
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

function requireStaff(req, res, next) {
  return requireRoles(['Staff', 'Admin'])(req, res, next);
}

module.exports = { requireRoles, requireAdmin, requireStaff };
