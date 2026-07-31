const express = require('express');
const router = express.Router();
const {
  getSummary,
  getDailyReport,
  getWeeklyReport,
  getMonthlyReport,
  getCustomRangeReport,
  getCourseWiseReport,
  getStudentLedger,
  getPendingReport,
  getOverdueReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/permissionMiddleware');

// Apply protection and permission check middlewares to all report routes
router.use(protect);
router.use(authorize('access_fees'));

router.get('/summary', getSummary);
router.get('/daily', getDailyReport);
router.get('/weekly', getWeeklyReport);
router.get('/monthly', getMonthlyReport);
router.get('/custom', getCustomRangeReport);
router.get('/course-wise', getCourseWiseReport);
router.get('/student-ledger/:studentId', getStudentLedger);
router.get('/pending', getPendingReport);
router.get('/overdue', getOverdueReport);

module.exports = router;
