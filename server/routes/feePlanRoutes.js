const express = require('express');
const router = express.Router();
const {
  createPlan,
  getPlanByStudent,
  updatePlan,
  deletePlan
} = require('../controllers/feePlanController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/permissionMiddleware');
const { validateFeePlanInput } = require('../validators/feePlanValidator');

// Apply authentication protection and roles claim checks to all routes in this group
router.use(protect);
router.use(authorize('access_fees'));

// Create student Fee Plan
router.post('/', validateFeePlanInput, createPlan);

// Fetch, update and soft-delete student Fee Plan by studentId Object ID
router.get('/:studentId', getPlanByStudent);
router.put('/:studentId', validateFeePlanInput, updatePlan);
router.delete('/:studentId', deletePlan);

module.exports = router;
