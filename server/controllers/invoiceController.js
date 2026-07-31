const invoiceService = require('../services/invoiceService');
const { sendSuccess } = require('../utils/responseHelper');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Invoice Controller - Directs billing inquiries to the invoice service.
 * Handles request mapping and success response generation.
 */

const getInvoices = asyncHandler(async (req, res) => {
  const result = await invoiceService.listInvoices(req.query);
  return sendSuccess(res, 'Invoices retrieved successfully', result, 200);
});

const getInvoiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const invoice = await invoiceService.getInvoiceDetails(id);
  return sendSuccess(res, 'Invoice details retrieved', invoice, 200);
});

const downloadInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const result = await invoiceService.downloadInvoice(id);
  return sendSuccess(res, 'Invoice download simulated', result, 200);
});

module.exports = {
  getInvoices,
  getInvoiceById,
  downloadInvoice
};
