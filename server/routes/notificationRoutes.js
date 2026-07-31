const express = require('express');
const router = express.Router();
const {
  getNotifications,
  getUnreadCount,
  getNotificationById,
  markRead,
  markAllRead,
  deleteNotification
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

// Apply protection authentication middleware to all notification routes
router.use(protect);

router.get('/', getNotifications);
router.get('/unread', getUnreadCount);
router.get('/:id', getNotificationById);
router.put('/read/:id', markRead);
router.put('/read-all', markAllRead);
router.delete('/:id', deleteNotification);

module.exports = router;
