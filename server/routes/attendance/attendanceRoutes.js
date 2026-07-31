const express = require('express');
const router = express.Router();
const {
  getTodayAttendance,
  checkInEmployee,
  checkOutEmployee,
  getDailyAttendanceSummary,
  getAttendanceStats
} = require('../../controllers/attendance/attendanceController');
const { employeeProtect } = require('../../middleware/employeeAuthMiddleware');
const { protect } = require('../../middleware/authMiddleware');

// Employee Attendance Routes
router.get('/today', employeeProtect, getTodayAttendance);
router.post('/checkin', employeeProtect, checkInEmployee);
router.post('/checkout', employeeProtect, checkOutEmployee);

// Admin Attendance Routes
router.get('/summary', protect, getDailyAttendanceSummary);
router.get('/stats', protect, getAttendanceStats);

module.exports = router;
