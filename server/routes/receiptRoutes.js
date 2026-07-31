const express = require('express');
const router = express.Router();
const {
  getReceipts,
  getReceiptById,
  downloadReceipt
} = require('../controllers/receiptController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/permissionMiddleware');

// Apply protection and permission check middlewares to all receipt routes
router.use(protect);
router.use(authorize('access_fees'));

router.get('/', getReceipts);
router.get('/:id', getReceiptById);
router.get('/download/:id', downloadReceipt);

module.exports = router;
