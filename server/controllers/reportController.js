const reportService = require('../services/reportService');
const { sendSuccess } = require('../utils/responseHelper');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Report Controller - Directs incoming HTTP report queries to the reportService layer.
 * Standardizes output JSON structure and manages success mapping.
 */

const getSummary = asyncHandler(async (req, res) => {
  const summary = await reportService.getSummary();
  return sendSuccess(res, 'Report summary card metrics retrieved', summary, 200);
});

const getDailyReport = asyncHandler(async (req, res) => {
  const data = await reportService.getDailyReport(req.query);
  return sendSuccess(res, 'Daily collection report generated', data, 200);
});

const getWeeklyReport = asyncHandler(async (req, res) => {
  const data = await reportService.getWeeklyReport(req.query);
  return sendSuccess(res, 'Weekly collection report generated', data, 200);
});

const getMonthlyReport = asyncHandler(async (req, res) => {
  const data = await reportService.getMonthlyReport(req.query);
  return sendSuccess(res, 'Monthly collection report generated', data, 200);
});

const getCustomRangeReport = asyncHandler(async (req, res) => {
  const data = await reportService.getCustomRangeReport(req.query);
  return sendSuccess(res, 'Custom range collection report generated', data, 200);
});

const getCourseWiseReport = asyncHandler(async (req, res) => {
  const data = await reportService.getCourseWiseReport();
  return sendSuccess(res, 'Course-wise collection report generated', data, 200);
});

const getStudentLedger = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const ledger = await reportService.getStudentLedger(studentId);
  return sendSuccess(res, 'Student ledger compiled successfully', ledger, 200);
});

const getPendingReport = asyncHandler(async (req, res) => {
  const data = await reportService.getPendingReport(req.query);
  return sendSuccess(res, 'Pending dues report generated', data, 200);
});

const getOverdueReport = asyncHandler(async (req, res) => {
  const data = await reportService.getOverdueReport(req.query);
  return sendSuccess(res, 'Overdue dues report generated', data, 200);
});

module.exports = {
  getSummary,
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
  getCustomRangeReport,
  getCourseWiseReport,
  getStudentLedger,
  getPendingReport,
  getOverdueReport
};
