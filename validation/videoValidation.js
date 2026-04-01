const Joi = require('joi');

const createVideoSchema = Joi.object({
  title: Joi.string().trim().max(100).required(),
  description: Joi.string().max(500).allow('', null),
  url: Joi.string().required(),
  thumbnailUrl: Joi.string().allow('', null),
  duration: Joi.number().min(0).default(0),
  tenantId: Joi.string().required()
});

const updateVideoSchema = Joi.object({
  title: Joi.string().trim().max(100),
  description: Joi.string().max(500).allow('', null),
  status: Joi.string().valid('Processing', 'Safe', 'Flagged')
});

module.exports = {
  createVideoSchema,
  updateVideoSchema
};
