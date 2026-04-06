const { db } = require('../db');
const { v4: uuidv4 } = require('uuid');

async function create(recordData) {
  const id = uuidv4();
  await db('financial_records').insert({ ...recordData, id });
  return findById(id);
}

async function findById(id) {
  return db('financial_records').where('id', id).first();
}

async function list(filters = {}) {
  let query = db('financial_records').select('*');
  if (filters.category) query.where('category', filters.category);
  if (filters.min_amount) query.where('amount', '>=', filters.min_amount);
  if (filters.max_amount) query.where('amount', '<=', filters.max_amount);
  if (filters.created_by) query.where('created_by', filters.created_by);
  query.orderBy('created_at', 'desc');
  const data = await query;
  const total = await db('financial_records').count().where(filters).first();
  return { data, total: parseInt(total.count) };
}

async function update(id, updates) {
  updates.updated_at = db.fn.now();
  await db('financial_records').where('id', id).update(updates);
  return findById(id);
}

async function remove(id) {
  return db('financial_records').where('id', id).del();
}

async function getSummary() {
  const income = db('financial_records').sum('amount').where('amount', '>', 0).first();
  const expense = db('financial_records').sum('amount').where('amount', '<', 0).first();
  const [inc, exp] = await Promise.all([income, expense]);
  return {
    total_income: parseFloat(inc['sum']) || 0,
    total_expense: Math.abs(parseFloat(exp['sum']) || 0),
    net: (parseFloat(inc['sum']) || 0) - Math.abs(parseFloat(exp['sum']) || 0)
  };
}

module.exports = { create, findById, list, update, remove, getSummary };
