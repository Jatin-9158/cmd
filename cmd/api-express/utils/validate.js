const Joi = require('joi');

const schemas = {
  register: Joi.object({
    email: Joi.string().email().max(255).required(),
    password: Joi.string().min(8).required()
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  refresh: Joi.object({
    refresh_token: Joi.string().required()
  }),
  logout: Joi.object({
    refresh_token: Joi.string().required()
  })
  // Add more as needed for records, etc.
};

function validate(schemaName, data) {
  const { error, value } = schemas[schemaName].validate(data);
  if (error) {
    throw new Error(error.details.map(d => d.message).join(', '));
  }
  return value;
}

module.exports = { validate };
