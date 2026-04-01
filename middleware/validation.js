/**
 * Joi validation middleware wrappers
 */

const validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const details = error.details.map((detail) => ({
      field: detail.path[0],
      message: detail.message,
      value: detail.context.value
    }));
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      details,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
  next();
};

const validateQuery = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.query, { abortEarly: false });
  if (error) {
    const details = error.details.map((detail) => ({
      field: detail.path[0],
      message: detail.message,
      value: detail.context.value
    }));
    return res.status(400).json({
      success: false,
      message: 'Invalid query parameters',
      details,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
  next();
};

const validateParams = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.params, { abortEarly: false });
  if (error) {
    const details = error.details.map((detail) => ({
      field: detail.path[0],
      message: detail.message,
      value: detail.context.value
    }));
    return res.status(400).json({
      success: false,
      message: 'Invalid URL parameters',
      details,
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }
  next();
};

module.exports = {
  validateBody,
  validateQuery,
  validateParams
};
