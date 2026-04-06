const config = require('./config');
const knex = require('knex');
const knexConfig = require('./knexfile')[config.env];

const db = knex(knexConfig);

db.raw('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;').catch(err => {
  console.error('DB pragma failed:', err);
});

async function testConnection() {
  try {
    await db.raw('SELECT 1');
    console.log('DB connected successfully');
  } catch (err) {
    console.error('DB connection failed:', err);
    throw err;
  }
}

module.exports = { db, testConnection };
