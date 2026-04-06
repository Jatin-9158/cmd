const express = require('express');
const router = express.Router();
const recordService = require('../services/recordService');
const { requireRole } = require('../middleware/role');
const authenticate = require('../middleware/auth');
const { ok, created } = require('../utils/response');

router.use(authenticate);

router.get('', async (req, res) => {
  try {
    const filters = req.query; // simple filters: category, min_amount, etc.
    const { data, total } = await recordService.list(filters);
    ok(res, { data, pagination: { total, page: parseInt(req.query.page) || 1 } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const record = await recordService.getById(req.params.id);
    ok(res, record);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.post('', requireRole('analyst', 'admin'), async (req, res) => {
  try {
    const record = await recordService.create(req.user.user_id, req.body);
    created(res, record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put('/:id', requireRole('admin'), async (req, res) => {
  try {
    const record = await recordService.update(req.params.id, req.body, req.user.user_id);
    ok(res, record);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.delete('/:id', requireRole('admin'), async (req, res) => {
  try {
    await recordService.remove(req.params.id, req.user.user_id);
    res.status(204).end();
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
