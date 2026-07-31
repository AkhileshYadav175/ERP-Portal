/**
 * Response Helper - Standardizes JSON response structures across Fees Management APIs.
 */

/**
 * Send a success response.
 * @param {Object} res - Express Response object.
 * @param {string} message - User-friendly message.
 * @param {Object|Array} data - Returned payload data.
 * @param {number} statusCode - HTTP status code (default: 200).
 */
const sendSuccess = (res, message, data = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data
  });
};

/**
 * Send an error response.
 * @param {Object} res - Express Response object.
 * @param {string} message - Core error message.
 * @param {Array|string|Object} errors - Additional details or validation logs.
 * @param {number} statusCode - HTTP status code (default: 400).
 */
const sendError = (res, message, errors = [], statusCode = 400) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors: Array.isArray(errors) ? errors : [errors]
  });
};

module.exports = {
  sendSuccess,
  sendError
};
