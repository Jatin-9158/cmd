const jwt = require('jsonwebtoken');
const config = require('../config');
const { v4: uuidv4 } = require('uuid');

function generateAccessToken(userId, role) {
  const payload = {
    user_id: userId,
    role: role
  };
  return jwt.sign(payload, config.jwtAccessSecret, {
    expiresIn: `${config.jwtAccessExpiryMinutes}m`
  });
}

function generateRefreshToken() {
  return uuidv4();
}

function parseAccessToken(token) {
  try {
    return jwt.verify(token, config.jwtAccessSecret);
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      const error = new Error('access token has expired');
      error.status = 401;
      error.code = 'TOKEN_EXPIRED';
      throw error;
    }
    throw err;
  }
}

module.exports = { generateAccessToken, generateRefreshToken, parseAccessToken };
