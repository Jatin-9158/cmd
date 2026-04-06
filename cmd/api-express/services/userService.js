const UserModel = require('../models/User');
const TokenModel = require('../models/Token');
const logger = require('../middleware/logger');

async function getById(id) {
  const user = await UserModel.findById(id);
  if (!user) {
    const err = new Error('user not found');
    err.status = 404;
    throw err;
  }
  return user;
}

async function list() {
  return UserModel.list();
}

async function updateRole(id, role) {
  const user = await getById(id);
  await UserModel.updateRole(id, role);
  logger.info('user role updated', { userId: id, newRole: role });
  return user;
}

async function updateStatus(id, status, invalidateSessions = true) {
  await UserModel.updateStatus(id, status);
  if (invalidateSessions) {
    await TokenModel.deleteByUserId(id);
  }
  logger.info('user status updated', { userId: id, status });
}

module.exports = {
  getById,
  list,
  updateRole,
  updateStatus
};
