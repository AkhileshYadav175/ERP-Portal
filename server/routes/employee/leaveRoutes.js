const express = require('express');
const router = express.Router();
const { applyLeave, getMyLeaves } = require('../../controllers/employee/leaveController');
const { employeeProtect } = require('../../middleware/employeeAuthMiddleware');

router.use(employeeProtect);

router.post('/', applyLeave);
router.get('/', getMyLeaves);

module.exports = router;
