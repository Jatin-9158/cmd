const UserModel = require('../models/User');
const TokenModel = require('../models/Token');
const { hashPassword, verifyPassword, hashToken } = require('../utils/hash');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const logger = require('../middleware/logger');
const config = require('../config');

async function register(email, password) {
  if (await UserModel.emailExists(email)) {
    const err = new Error('email already exists');
    err.status = 409;
    throw err;
  }

  const hashedPw = await hashPassword(password);
  const user = await UserModel.create({
    email,
    password_hash: hashedPw,
    role: 'viewer'
  });

  logger.info('user registered', { userId: user.id, email: user.email });
  return user;
}

async function login(email, password) {
  const user = await UserModel.findByEmail(email);
  if (!user || !user.status === 'active' || !(await verifyPassword(password, user.password_hash))) {
    const err = new Error('invalid credentials');
    err.status = 401;
    throw err;
  }

  const tokenPair = await issueTokenPair(user.id);
  logger.info('user logged in', { userId: user.id });
  return tokenPair;
}

async function refresh(refreshTokenRaw) {
  const hash = await hashToken(refreshTokenRaw);
  const storedToken = await TokenModel.findByHash(hash);

  if (!storedToken || storedToken.expires_at < new Date()) {
    const err = new Error('invalid refresh token');
    err.status = 401;
    throw err;
  }

  const tokenPair = await issueTokenPair(storedToken.user_id);
  await TokenModel.deleteByHash(hash); // single use
  return tokenPair;
}

async function logout(refreshTokenRaw) {
  const hash = await hashToken(refreshTokenRaw);
  await TokenModel.deleteByHash(hash);
}

async function issueTokenPair(userId) {
  const accessToken = generateAccessToken(userId, 'viewer'); // role from user later
  const refreshToken = generateRefreshToken();
  const hash = await hashToken(refreshToken);
  const expiresAt = new Date(Date.now() + config.jwtRefreshExpiryDays * 24 * 60 * 60 * 1000);

  await TokenModel.create({
    user_id: userId,
    token_hash: hash,
    expires_at: expiresAt
  });

  return {
    access_token: accessToken,
    refresh_token: refreshToken
  };
}

module.exports = {
  register,
  login,
  refresh,
  logout,
  issueTokenPair
};
