function sendResponse(res, statusCode, data = null, message = null) {
  const response = {};
  if (data !== null || data !== undefined) response.data = data;
  if (message) response.message = message;
  res.status(statusCode).json(response);
}

function ok(res, data) {
  sendResponse(res, 200, data);
}

function created(res, data) {
  sendResponse(res, 201, data);
}

function noContent(res) {
  res.status(204).end();
}

function badRequest(res, message, fields = null) {
  const response = { error: message };
  if (fields) response.fields = fields;
  res.status(400).json(response);
}

function validationError(res, errors) {
  badRequest(res, 'validation failed', errors);
}

module.exports = { ok, created, noContent, badRequest, validationError };
