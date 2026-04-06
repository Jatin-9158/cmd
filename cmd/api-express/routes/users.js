const express = require('express');
const router = express.Router();
const userService = require('../services/userService');
const { requireRole, requireRoleOrSelf } = require('../middleware/role');
const authenticate = require('../middleware/auth');
const { ok } = require('../utils/response');
const logger = require('../middleware/logger');

router.use(authenticate);

router.get('', requireRole('admin'), async (req, res) => {
  try {
    const users = await userService.list();
    ok(res, users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', requireRoleOrSelf(['admin']), async (req, res) => {
  try {
    const user = await userService.getById(req.params.id);
    ok(res, user);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.patch('/:id/role', requireRole('admin'), async (req, res) => {
  try {
    const user = await userService.updateRole(req.params.id, req.body.role);
    ok(res, user);
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

router.patch('/:id/status', requireRole('admin'), async (req, res) => {
  try {
    await userService.updateStatus(req.params.id, req.body.status);
    ok(res, { message: 'status updated' });
  } catch (err) {
    res.status(err.status || 500).json({ error: err.message });
  }
});

module.exports = router;
