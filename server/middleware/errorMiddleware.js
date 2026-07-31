const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || [message];

  // Log error using production logger
  logger.error(`${req.method} ${req.originalUrl} - ${statusCode} - ${message}`, {
    stack: err.stack,
    errors
  });

  res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors],
    timestamp: new Date().toISOString()
  });
};

module.exports = errorHandler;
