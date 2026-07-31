const express = require('express');
const router = express.Router();
const {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getDashboardSummary
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/permissionMiddleware');
const { validateStudentInput } = require('../validators/studentValidator');

// Apply authentication protection and role-permission claim check on all routes in this group
router.use(protect);
router.use(authorize('access_fees'));

// Dashboard aggregates metric summaries (Must reside before :id to prevent parameter matching collision)
router.get('/dashboard-summary', getDashboardSummary);

// List and Create Student entries
router.post('/', validateStudentInput, createStudent);
router.get('/', getStudents);

// Fetch, update and soft-delete student profiles by ID
router.get('/:id', getStudentById);
router.put('/:id', validateStudentInput, updateStudent);
router.delete('/:id', deleteStudent);

module.exports = router;
