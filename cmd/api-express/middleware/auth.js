const jwt = require('../utils/jwt');
const logger = require('./logger');
const config = require('../config');

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing or invalid authorization header' });
  }

  const token = authHeader.substring(7);
  try {
    const claims = jwt.parseAccessToken(token);
    req.user = claims;
    next();
  } catch (err) {
    logger.error('auth middleware failed', { error: err.message, token: token.substring(0, 20) + '...' });
    res.status(err.status || 401).json({ error: err.message });
  }
}

module.exports = authenticate;
