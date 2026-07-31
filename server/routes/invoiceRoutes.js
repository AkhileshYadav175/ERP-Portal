const express = require('express');
const router = express.Router();
const {
  getInvoices,
  getInvoiceById,
  downloadInvoice
} = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/permissionMiddleware');

// Apply protection and permission check middlewares to all invoice routes
router.use(protect);
router.use(authorize('access_fees'));

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.get('/download/:id', downloadInvoice);

module.exports = router;
