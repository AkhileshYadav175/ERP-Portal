const dashboardService = require('../services/dashboardService');
const { sendSuccess } = require('../utils/responseHelper');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Dashboard Controller - Directs dashboard queries to the dashboardService layer.
 * Standardizes API output format and handles HTTP success mappings.
 */

const getSummary = asyncHandler(async (req, res) => {
  const summary = await dashboardService.getSummary(req.query);
  return sendSuccess(res, 'Summary metrics retrieved successfully', summary, 200);
});

const getCharts = asyncHandler(async (req, res) => {
  const charts = await dashboardService.getCharts(req.query);
  return sendSuccess(res, 'Chart metrics compiled successfully', charts, 200);
});

const getRecentPayments = asyncHandler(async (req, res) => {
  const payments = await dashboardService.getRecentPayments();
  return sendSuccess(res, 'Recent payments list retrieved successfully', payments, 200);
});

const getUpcomingDue = asyncHandler(async (req, res) => {
  const list = await dashboardService.getUpcomingDue();
  return sendSuccess(res, 'Upcoming dues list retrieved successfully', list, 200);
});

const getOverdue = asyncHandler(async (req, res) => {
  const list = await dashboardService.getOverdue();
  return sendSuccess(res, 'Overdue list retrieved successfully', list, 200);
});

const getRecentStudents = asyncHandler(async (req, res) => {
  const students = await dashboardService.getRecentStudents();
  return sendSuccess(res, 'Recent admissions list retrieved successfully', students, 200);
});

const getRecentActivities = asyncHandler(async (req, res) => {
  const activities = await dashboardService.getRecentActivities();
  return sendSuccess(res, 'Recent audit logs list retrieved successfully', activities, 200);
});

module.exports = {
  getSummary,
  getCharts,
  getRecentPayments,
  getUpcomingDue,
  getOverdue,
  getRecentStudents,
  getRecentActivities
};
