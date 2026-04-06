const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { db, testConnection } = require('./db');
const config = require('./config');
const logger = require('./middleware/logger');
const errorHandler = require('./middleware/error')(logger);
const authRouter = require('./routes/auth');
const usersRouter = require('./routes/users');
const recordsRouter = require('./routes/records');
const dashboardRouter = require('./routes/dashboard');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '1mb' }));

// Health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// API v1
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', usersRouter);
app.use('/api/v1/records', recordsRouter);
app.use('/api/v1/dashboard', dashboardRouter);

// Error handler last
app.use(errorHandler);

// Start
async function start() {
  try {
    await testConnection();
    logger.info('DB connected');
    logger.info(`Server starting on port ${config.port} (${config.env})`);
    app.listen(config.port, () => {
      logger.info('Server running');
    });
  } catch (err) {
    logger.error('Failed to start', { error: err.message });
    process.exit(1);
  }
}

start();

module.exports = app;
