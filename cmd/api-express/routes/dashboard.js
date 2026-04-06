const express = require('express');
const router = express.Router();
const dashboardService = require('../services/dashboardService');
const { requireRole } = require('../middleware/role');
const authenticate = require('../middleware/auth');
const { ok } = require('../utils/response');

router.use(authenticate);
router.use(requireRole('analyst', 'admin'));

router.get('/summary', async (req, res) => {
  try {
    const summary = await dashboardService.getSummary();
    ok(res, summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/trends', async (req, res) => {
  try {
    const months = parseInt(req.query.months) || 6;
    const trends = await dashboardService.getTrends(months);
    ok(res, trends);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/categories', async (req, res) => {
  try {
    const totals = await dashboardService.getCategoryTotals();
    ok(res, totals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/recent', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const recent = await dashboardService.getRecentActivity(limit);
    ok(res, recent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
