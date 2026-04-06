require('dotenv').config();

const requiredConfig = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET'
];

requiredConfig.forEach(key => {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
});

const config = {
  port: process.env.PORT || '8080',
  databaseDSN: process.env.DATABASE_DSN || './finance.db',
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiryMinutes: parseInt(process.env.JWT_ACCESS_EXPIRY_MINUTES) || 15,
  jwtRefreshExpiryDays: parseInt(process.env.JWT_REFRESH_EXPIRY_DAYS) || 7,
  env: process.env.NODE_ENV || 'development'
};

module.exports = config;
