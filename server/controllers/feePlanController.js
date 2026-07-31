const feePlanService = require('../services/feePlanService');
const { sendSuccess } = require('../utils/responseHelper');
const asyncHandler = require('../utils/asyncHandler');

/**
 * FeePlan Controller - Directs incoming requests for Fee Plans to services.
 * Handles request parsing and maps standard success responses.
 */

/**
 * Create a new student Fee Plan.
 * @route POST /api/fee-plan
 */
const createPlan = asyncHandler(async (req, res) => {
  const creatorId = req.user.id || req.user._id;
  const newPlan = await feePlanService.setupFeePlan(req.body, creatorId);
  return sendSuccess(res, 'Fee Plan created successfully', newPlan, 201);
});

/**
 * Fetch a student's active Fee Plan by student Object ID.
 * @route GET /api/fee-plan/:studentId
 */
const getPlanByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const plan = await feePlanService.getFeePlan(studentId);
  return sendSuccess(res, 'Fee Plan retrieved successfully', plan, 200);
});

/**
 * Update editable parameters of a student's active Fee Plan.
 * @route PUT /api/fee-plan/:studentId
 */
const updatePlan = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const modifierId = req.user.id || req.user._id;
  const updatedPlan = await feePlanService.updateFeePlan(studentId, req.body, modifierId);
  return sendSuccess(res, 'Fee Plan updated successfully', updatedPlan, 200);
});

/**
 * Soft-delete a student's active Fee Plan.
 * @route DELETE /api/fee-plan/:studentId
 */
const deletePlan = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const userId = req.user.id || req.user._id;
  const deletedPlan = await feePlanService.deleteFeePlan(studentId, userId);
  return sendSuccess(res, 'Fee Plan deleted successfully', deletedPlan, 200);
});

module.exports = {
  createPlan,
  getPlanByStudent,
  updatePlan,
  deletePlan
};
