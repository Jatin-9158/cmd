const express = require('express');
const router = express.Router();
const authService = require('../services/authService');
const { validate } = require('../utils/validate');
const { badRequest, ok, created, noContent } = require('../utils/response');
const logger = require('../middleware/logger');
const authenticate = require('../middleware/auth');

router.post('/register', async (req, res) => {
  try {
    const { email, password } = validate('register', req.body);
    const user = await authService.register(email, password);
    created(res, { id: user.id, email: user.email, role: user.role });
  } catch (err) {
    if (err.status) badRequest(res, err.message);
    else badRequest(res, 'registration failed');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = validate('login', req.body);
    const tokens = await authService.login(email, password);
    ok(res, tokens);
  } catch (err) {
    badRequest(res, err.message);
  }
});

router.post('/refresh', async (req, res) => {
  try {
    const { refresh_token } = validate('refresh', req.body);
    const tokens = await authService.refresh(refresh_token);
    ok(res, tokens);
  } catch (err) {
    badRequest(res, err.message);
  }
});

router.post('/logout', authenticate, async (req, res) => {
  try {
    const { refresh_token } = validate('logout', req.body);
    await authService.logout(refresh_token);
    logger.info('user logged out', { userId: req.user.user_id });
    noContent(res);
  } catch (err) {
    badRequest(res, err.message);
  }
});

module.exports = router;
