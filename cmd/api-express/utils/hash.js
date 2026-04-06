const bcrypt = require('bcryptjs');
const saltRounds = 12;

async function hashPassword(password) {
  return bcrypt.hash(password, saltRounds);
}

async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

async function hashToken(token) {
  return bcrypt.hash(token, saltRounds);
}

module.exports = { hashPassword, verifyPassword, hashToken };
