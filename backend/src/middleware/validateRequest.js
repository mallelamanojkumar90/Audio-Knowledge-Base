/**
 * Request validation middleware
 * Validates request body, query, or params based on schema
 */
const validateRequest = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));

      return res.status(400).json({
        error: {
          message: 'Validation failed',
          details: errors
        }
      });
    }

    // Replace request property with validated value
    req[property] = value;
    next();
  };
};

module.exports = validateRequest;

