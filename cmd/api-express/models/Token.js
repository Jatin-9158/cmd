const { db } = require('../db');
const { v4: uuidv4 } = require('uuid');

async function create(tokenData) {
  const id = uuidv4();
  await db('refresh_tokens').insert({ ...tokenData, id });
}

async function findByHash(hash) {
  return db('refresh_tokens').where('token_hash', hash).first();
}

async function deleteByHash(hash) {
  return db('refresh_tokens').where('token_hash', hash).del();
}

async function deleteByUserId(userId) {
  return db('refresh_tokens').where('user_id', userId).del();
}

module.exports = { create, findByHash, deleteByHash, deleteByUserId };
