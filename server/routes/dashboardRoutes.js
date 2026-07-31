const express = require('express');
const router = express.Router();
const {
  getSummary,
  getCharts,
  getRecentPayments,
  getUpcomingDue,
  getOverdue,
  getRecentStudents,
  getRecentActivities
} = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/permissionMiddleware');

// Apply protection and permission claims gate checks to all dashboard operations
router.use(protect);
router.use(authorize('access_fees'));

router.get('/summary', getSummary);
router.get('/charts', getCharts);
router.get('/recent-payments', getRecentPayments);
router.get('/upcoming-due', getUpcomingDue);
router.get('/overdue', getOverdue);
router.get('/recent-students', getRecentStudents);
router.get('/recent-activities', getRecentActivities);

module.exports = router;
