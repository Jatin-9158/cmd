const { db } = require('../db');
const { v4: uuidv4 } = require('uuid');

async function findById(id) {
  return db('users').where('id', id).first();
}

async function findByEmail(email) {
  return db('users').where('email', email).first();
}

async function create(userData) {
  const id = uuidv4();
  await db('users').insert({ ...userData, id });
  return findById(id);
}

async function list() {
  return db('users').select('*');
}

async function updateRole(id, role) {
  await db('users').where('id', id).update({ role, updated_at: db.fn.now() });
  return findById(id);
}

async function updateStatus(id, status) {
  await db('users').where('id', id).update({ status, updated_at: db.fn.now() });
  return findById(id);
}

async function emailExists(email) {
  const count = await db('users').where('email', email).count();
  return parseInt(count[0].count) > 0;
}

module.exports = {
  findById,
  findByEmail,
  create,
  list,
  updateRole,
  updateStatus,
  emailExists
};
