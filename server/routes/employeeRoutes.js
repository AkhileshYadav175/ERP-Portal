const express = require('express');
const router = express.Router();
const {
  registerEmployee,
  loginEmployee,
  getEmployeeProfile,
  getTodayAttendance,
  checkInEmployee,
  checkOutEmployee
} = require('../controllers/employeeController');
const { employeeProtect } = require('../middleware/employeeAuthMiddleware');

router.post('/register', registerEmployee);
router.post('/login', loginEmployee);
router.get('/me', employeeProtect, getEmployeeProfile);
router.get('/attendance/today', employeeProtect, getTodayAttendance);
router.post('/attendance/checkin', employeeProtect, checkInEmployee);
router.post('/attendance/checkout', employeeProtect, checkOutEmployee);

module.exports = router;
