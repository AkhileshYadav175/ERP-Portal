const { sendError } = require('../utils/responseHelper');

/**
 * Custom validation middleware for updating installments.
 * Restricts updates to editable parameters (dueDate, remarks).
 */
const validateInstallmentUpdate = (req, res, next) => {
  const { dueDate, remarks } = req.body;
  const errors = [];

  // Enforce strict check on editable fields
  const allowedFields = ['dueDate', 'remarks'];
  const keys = Object.keys(req.body);
  const invalidFields = keys.filter((key) => !allowedFields.includes(key));

  if (invalidFields.length > 0) {
    errors.push(`The following fields are not editable: ${invalidFields.join(', ')}`);
  }

  if (dueDate) {
    const dateVal = Date.parse(dueDate);
    if (isNaN(dateVal)) {
      errors.push('Please provide a valid due date.');
    }
  }

  if (remarks !== undefined && typeof remarks !== 'string') {
    errors.push('Remarks must be a text string.');
  }

  if (errors.length > 0) {
    return sendError(res, 'Validation failed', errors, 400);
  }

  next();
};

module.exports = {
  validateInstallmentUpdate
};
