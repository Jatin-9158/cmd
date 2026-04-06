const RecordModel = require('../models/Record');
const logger = require('../middleware/logger');

async function create(createdBy, data) {
  const record = await RecordModel.create({
    ...data,
    created_by: createdBy
  });
  logger.info('record created', { recordId: record.id, createdBy });
  return record;
}

async function getById(id) {
  const record = await RecordModel.findById(id);
  if (!record) {
    const err = new Error('record not found');
    err.status = 404;
    throw err;
  }
  return record;
}

async function list(filters) {
  return RecordModel.list(filters);
}

async function update(id, updates, createdBy) {
  const record = await getById(id);
  if (record.created_by !== createdBy) {
    const err = new Error('not authorized to update this record');
    err.status = 403;
    throw err;
  }
  return RecordModel.update(id, updates);
}

async function remove(id, createdBy) {
  const record = await getById(id);
  if (record.created_by !== createdBy) {
    const err = new Error('not authorized to delete this record');
    err.status = 403;
    throw err;
  }
  await RecordModel.remove(id);
}

module.exports = {
  create,
  getById,
  list,
  update,
  remove
};
