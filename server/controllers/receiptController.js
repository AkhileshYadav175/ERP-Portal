const receiptService = require('../services/receiptService');
const { sendSuccess } = require('../utils/responseHelper');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Receipt Controller - Handles incoming HTTP requests for receipts.
 * Delegates request processing to the receipt service layer.
 */

const getReceipts = asyncHandler(async (req, res) => {
  const result = await receiptService.listReceipts(req.query);
  return sendSuccess(res, 'Receipts retrieved successfully', result, 200);
});

const getReceiptById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const receipt = await receiptService.getReceiptDetails(id);
  return sendSuccess(res, 'Receipt details retrieved', receipt, 200);
});

const downloadReceipt = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await receiptService.markReceiptDownloaded(id);
  return sendSuccess(res, 'Receipt download simulated', result, 200);
});

module.exports = {
  getReceipts,
  getReceiptById,
  downloadReceipt
};
