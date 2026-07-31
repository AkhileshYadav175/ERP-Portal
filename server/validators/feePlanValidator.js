const mongoose = require('mongoose');
const { sendError } = require('../utils/responseHelper');

/**
 * Custom validation middleware for creating/updating student Fee Plans.
 * Validates plan structures, limits on installment counts, and due date declarations.
 */
const validateFeePlanInput = (req, res, next) => {
  const { studentId, totalFees, paymentPlan, numberOfInstallments, firstDueDate } = req.body;
  const errors = [];

  // Validate studentId
  if (!studentId || !studentId.trim()) {
    errors.push('Student reference (studentId) is required.');
  } else if (!mongoose.Types.ObjectId.isValid(studentId.trim())) {
    errors.push('Please provide a valid Student reference ID.');
  }

  // Validate totalFees
  if (totalFees === undefined || totalFees === null) {
    errors.push('Total fees amount is required.');
  } else {
    const feesNum = Number(totalFees);
    if (isNaN(feesNum) || feesNum <= 0) {
      errors.push('Total fees must be greater than 0.');
    }
  }

  // Validate paymentPlan enum
  if (!paymentPlan) {
    errors.push('Payment plan selection is required.');
  } else if (paymentPlan !== 'FULL_PAYMENT' && paymentPlan !== 'INSTALLMENT') {
    errors.push('Payment plan must be either FULL_PAYMENT or INSTALLMENT.');
  }

  // Validate installment-specific fields
  if (paymentPlan === 'INSTALLMENT') {
    // Validate number of installments (min: 2, max: 24)
    if (numberOfInstallments === undefined || numberOfInstallments === null) {
      errors.push('Number of installments is required for installment plans.');
    } else {
      const instNum = Number(numberOfInstallments);
      if (isNaN(instNum) || !Number.isInteger(instNum) || instNum < 2 || instNum > 24) {
        errors.push('Number of installments must be an integer between 2 and 24.');
      }
    }

    // Validate firstDueDate
    if (!firstDueDate) {
      errors.push('First due date is required for installment plans.');
    } else {
      const dateVal = Date.parse(firstDueDate);
      if (isNaN(dateVal)) {
        errors.push('Please provide a valid first due date.');
      }
    }
  }

  if (errors.length > 0) {
    return sendError(res, 'Validation failed', errors, 400);
  }

  next();
};

module.exports = {
  validateFeePlanInput
};
