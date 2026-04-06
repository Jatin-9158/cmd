function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'insufficient permissions' });
    }
    next();
  };
}

function requireRoleOrSelf(roles) {
  return (req, res, next) => {
    const userId = req.params.id;
    if (req.user.user_id === userId || roles.includes(req.user.role)) {
      next();
    } else {
      res.status(403).json({ error: 'insufficient permissions' });
    }
  };
}

module.exports = { requireRole, requireRoleOrSelf };
