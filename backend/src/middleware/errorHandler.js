/**
 * Global error handling middleware
 */
const fs = require('fs');
const path = require('path');

const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  
  // Log to file
  try {
    const logFile = path.join(__dirname, '../../error.log');
    const logMessage = `${new Date().toISOString()} - ${err.message}\n${err.stack}\n\n`;
    fs.appendFileSync(logFile, logMessage);
  } catch (e) {
    console.error('Failed to write to error log:', e);
  }

  // Default error
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Handle specific error types
  if (err.name === 'ValidationError') {
    status = 400;
    message = err.message;
  } else if (err.name === 'UnauthorizedError') {
    status = 401;
    message = 'Unauthorized';
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid ID format';
  }

  // Send error response
  res.status(status).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err
      })
    }
  });
};

module.exports = errorHandler;

