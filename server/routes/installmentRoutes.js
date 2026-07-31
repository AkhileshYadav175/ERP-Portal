const express = require('express');
const router = express.Router();
const {
  getInstallmentsByStudent,
  getInstallmentDetails,
  updateInstallment,
  deleteInstallment
} = require('../controllers/installmentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/permissionMiddleware');
const { validateInstallmentUpdate } = require('../validators/installmentValidator');

// Apply authentication protection and roles claim checks to all routes in this group
router.use(protect);
router.use(authorize('access_fees'));

// Get all active installments for a student
router.get('/:studentId', getInstallmentsByStudent);

// Get single installment details by student Object ID and index number
router.get('/:studentId/:installmentNo', getInstallmentDetails);

// Update single installment parameters (dueDate, remarks)
router.put('/:id', validateInstallmentUpdate, updateInstallment);

// Soft-delete a single installment
router.delete('/:id', deleteInstallment);

module.exports = router;
