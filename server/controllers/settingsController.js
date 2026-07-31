const settingsRepository = require('../repositories/settingsRepository');
const { sendSuccess } = require('../utils/responseHelper');
const asyncHandler = require('../utils/asyncHandler');
const { BadRequestError } = require('../utils/customErrors');
const notificationService = require('../services/notificationService');

/**
 * Settings Controller - Manages reads, modifications, and default configuration fallback logic.
 * Enforces email checks, mobile phone length constraints, unique prefixes, and FY syntax formatting.
 */

const getSettings = asyncHandler(async (req, res) => {
  const settings = await settingsRepository.findOrCreate();
  return sendSuccess(res, 'Settings configuration retrieved', settings, 200);
});

const updateSettings = asyncHandler(async (req, res) => {
  const { institute, fee, receipt, invoice, general } = req.body;

  // 1. Validations: Email check
  if (institute && institute.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(institute.email)) {
      throw new BadRequestError('Invalid email address format.');
    }
  }

  // 2. Validations: Phone check
  if (institute && institute.mobile) {
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(institute.mobile)) {
      throw new BadRequestError('Mobile number must be exactly 10 digits.');
    }
  }

  // 3. Validations: Prefixes check (No duplicates)
  if (fee) {
    const { receiptPrefix, invoicePrefix, studentPrefix } = fee;
    if (receiptPrefix && invoicePrefix && receiptPrefix === invoicePrefix) {
      throw new BadRequestError('Receipt prefix and Invoice prefix cannot be identical.');
    }
    if (receiptPrefix && studentPrefix && receiptPrefix === studentPrefix) {
      throw new BadRequestError('Receipt prefix and Student prefix cannot be identical.');
    }
    if (invoicePrefix && studentPrefix && invoicePrefix === studentPrefix) {
      throw new BadRequestError('Invoice prefix and Student prefix cannot be identical.');
    }

    // 4. Financial year validation
    if (fee.financialYear) {
      const fyRegex = /^\d{4}-\d{4}$/;
      if (!fyRegex.test(fee.financialYear)) {
        throw new BadRequestError('Financial Year must follow the format YYYY-YYYY (e.g. 2026-2027).');
      }
    }
  }

  const settings = await settingsRepository.update(req.body);

  // Dynamic Notifications Center Trigger
  const userId = req.user.id || req.user._id;
  await notificationService.create({
    title: 'Settings Updated',
    message: 'Global ERP Billing configurations & parameters were modified by administrator.',
    module: 'System',
    type: 'WARNING',
    priority: 'HIGH',
    targetUser: userId,
    createdBy: userId,
    referenceId: settings._id,
    referenceType: 'Settings',
    actionUrl: '/fees/settings'
  });

  return sendSuccess(res, 'Settings updated successfully', settings, 200);
});

const resetSettings = asyncHandler(async (req, res) => {
  const settings = await settingsRepository.reset();

  // Dynamic Notifications Center Trigger
  const userId = req.user.id || req.user._id;
  await notificationService.create({
    title: 'Settings Reset',
    message: 'Global ERP Billing configurations were reset to factory defaults by administrator.',
    module: 'System',
    type: 'ERROR',
    priority: 'CRITICAL',
    targetUser: userId,
    createdBy: userId,
    referenceId: settings._id,
    referenceType: 'Settings',
    actionUrl: '/fees/settings'
  });

  return sendSuccess(res, 'Settings reset to original defaults', settings, 200);
});

module.exports = {
  getSettings,
  updateSettings,
  resetSettings
};
