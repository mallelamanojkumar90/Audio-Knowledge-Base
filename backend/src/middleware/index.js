// Export all middleware for easy importing
const errorHandler = require('./errorHandler');
const notFound = require('./notFound');
const validateRequest = require('./validateRequest');
const asyncHandler = require('./asyncHandler');

module.exports = {
  errorHandler,
  notFound,
  validateRequest,
  asyncHandler
};

