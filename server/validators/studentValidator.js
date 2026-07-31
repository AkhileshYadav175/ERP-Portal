const { sendError } = require('../utils/responseHelper');

/**
 * Custom validation middleware for manually creating/updating students.
 * Conforms to the project's existing validator pattern.
 */
const validateStudentInput = (req, res, next) => {
  const { fullName, fatherName, mobile, email, address, course, totalFees, paymentPlan } = req.body;
  const errors = [];

  // Required Field Checks
  if (!fullName || !fullName.trim()) errors.push('Full name is required.');
  if (!fatherName || !fatherName.trim()) errors.push('Father name is required.');
  if (!mobile || !mobile.trim()) errors.push('Mobile number is required.');
  if (!email || !email.trim()) errors.push('Email address is required.');
  if (!address || !address.trim()) errors.push('Residential address is required.');
  if (!course || !course.trim()) errors.push('Course is required.');

  // Numerical Validation for fees
  if (totalFees === undefined || totalFees === null) {
    errors.push('Total fees definition is required.');
  } else {
    const feesNum = Number(totalFees);
    if (isNaN(feesNum) || feesNum < 0) {
      errors.push('Total fees cannot be negative.');
    }
  }

  // Payment Plan Enum Validation
  if (!paymentPlan) {
    errors.push('Billing payment plan is required.');
  } else if (paymentPlan !== 'FULL_PAYMENT' && paymentPlan !== 'INSTALLMENT') {
    errors.push('Payment plan must be either FULL_PAYMENT or INSTALLMENT.');
  }

  // Email format validation
  if (email && email.trim()) {
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email.trim())) {
      errors.push('Please provide a valid email address.');
    }
  }

  // Phone number validation
  if (mobile && mobile.trim()) {
    const mobileRegex = /^\+?[0-9]{10,14}$/;
    if (!mobileRegex.test(mobile.trim())) {
      errors.push('Please provide a valid mobile number.');
    }
  }

  // Return formatted errors array if validation fails
  if (errors.length > 0) {
    return sendError(res, 'Validation failed', errors, 400);
  }

  next();
};

module.exports = {
  validateStudentInput
};
