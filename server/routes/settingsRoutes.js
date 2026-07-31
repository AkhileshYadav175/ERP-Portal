const express = require('express');
const router = express.Router();
const {
  getSettings,
  updateSettings,
  resetSettings
} = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/permissionMiddleware');

// Apply protection and permission check middlewares to all settings routes
router.use(protect);
router.use(authorize('access_fees'));

router.get('/', getSettings);
router.put('/', updateSettings);
router.post('/reset', resetSettings);

module.exports = router;
