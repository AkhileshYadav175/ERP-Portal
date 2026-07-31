const installmentService = require('../services/installmentService');
const { sendSuccess } = require('../utils/responseHelper');
const asyncHandler = require('../utils/asyncHandler');
const { BadRequestError } = require('../utils/customErrors');

/**
 * Installment Controller - Processes API endpoints for student installments.
 * Delegates request processing to the service layer and manages output mapping.
 */

/**
 * List all installments for a specific student.
 * @route GET /api/installments/:studentId
 */
const getInstallmentsByStudent = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const data = await installmentService.listStudentInstallments(studentId);
  return sendSuccess(res, 'Student installment list retrieved successfully', data, 200);
});

/**
 * Retrieve details for a single installment by index number.
 * @route GET /api/installments/:studentId/:installmentNo
 */
const getInstallmentDetails = asyncHandler(async (req, res) => {
  const { studentId, installmentNo } = req.params;
  const instNo = parseInt(installmentNo);
  
  if (isNaN(instNo)) {
    throw new BadRequestError('Please provide a valid installment index number.');
  }
  
  const data = await installmentService.getSingleInstallment(studentId, instNo);
  return sendSuccess(res, 'Installment details retrieved successfully', data, 200);
});

/**
 * Update editable fields of a single installment.
 * @route PUT /api/installments/:id
 */
const updateInstallment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const modifierId = req.user.id || req.user._id;
  const updatedInst = await installmentService.updateInstallment(id, req.body, modifierId);
  return sendSuccess(res, 'Installment updated successfully', updatedInst, 200);
});

/**
 * Soft-delete a single installment.
 * @route DELETE /api/installments/:id
 */
const deleteInstallment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id || req.user._id;
  const deletedInst = await installmentService.removeInstallment(id, userId);
  return sendSuccess(res, 'Installment deleted successfully', deletedInst, 200);
});

module.exports = {
  getInstallmentsByStudent,
  getInstallmentDetails,
  updateInstallment,
  deleteInstallment
};
