const jwt = require('jsonwebtoken');
const { ADMIN_JWT_SECRET } = require('../config');

const ROLE_PERMISSIONS = {
  Owner:      ['all'],
  Ops:        ['view_users','edit_catalog','manage_sponsors','rotate_keys','send_advisories','takeover_wa','view_revenue','view_diagnoses','view_audit'],
  Agronomist: ['view_users','edit_catalog','send_advisories','takeover_wa','review_diagnoses','view_diagnoses'],
  Support:    ['view_users','takeover_wa','view_diagnoses'],
};

function adminAuthMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing admin token' });
  }
  const token = header.slice(7);
  try {
    req.admin = jwt.verify(token, ADMIN_JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired admin token' });
  }
}

function requirePermission(permission) {
  return (req, res, next) => {
    const role = req.admin?.role;
    const perms = ROLE_PERMISSIONS[role] || [];
    if (perms.includes('all') || perms.includes(permission)) {
      return next();
    }
    return res.status(403).json({ error: `Requires permission: ${permission}` });
  };
}

module.exports = { adminAuthMiddleware, requirePermission };
