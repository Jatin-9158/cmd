const RecordModel = require('../models/Record');
const logger = require('../middleware/logger');

async function getSummary() {
  return RecordModel.getSummary();
}

async function getTrends(months = 6) {
  // Simple monthly trends - adjust as needed
  const trends = await db.raw(`
    SELECT 
      strftime('%Y-%m', created_at) as month,
      SUM(amount) as total
    FROM financial_records 
    GROUP BY strftime('%Y-%m', created_at)
    ORDER BY month DESC
    LIMIT ?
  `, [months]);
  return trends;
}

async function getCategoryTotals() {
  const totals = await db.raw(`
    SELECT category, SUM(amount) as total
    FROM financial_records
    GROUP BY category
    ORDER BY total DESC
  `);
  return totals;
}

async function getRecentActivity(limit = 10) {
  return db('financial_records')
    .select('*')
    .orderBy('created_at', 'desc')
    .limit(limit);
}

module.exports = {
  getSummary,
  getTrends,
  getCategoryTotals,
  getRecentActivity
};
