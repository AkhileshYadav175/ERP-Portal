const express = require('express');
const router = express.Router();
const {
  getPendingEmployees,
  approveEmployee,
  rejectEmployee,
  getActiveEmployees,
  getDepartments,
  getDailyAttendanceSummary,
  getAttendanceStats,
  createEmployee
} = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');

router.get('/employees/pending', protect, getPendingEmployees);
router.post('/employees/:id/approve', protect, approveEmployee);
router.post('/employees/:id/reject', protect, rejectEmployee);
router.post('/employees/create', protect, createEmployee);
router.get('/attendance/summary', protect, getDailyAttendanceSummary);
router.get('/attendance/stats', protect, getAttendanceStats);
router.get('/employees', protect, getActiveEmployees);
router.get('/departments', getDepartments);

module.exports = router;
