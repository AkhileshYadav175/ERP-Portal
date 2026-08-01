const express = require('express');
const router = express.Router();
const { createLead, getLeads, deleteLead, updateLead, createOfflineLead } = require('../controllers/leadController');
const { protect } = require('../middleware/authMiddleware');

// Public endpoints
router.post('/', createLead);

// Protected endpoints
router.post('/offline', protect, createOfflineLead);
router.get('/', protect, getLeads);
router.delete('/:id', protect, deleteLead);
router.put('/:id', protect, updateLead);

module.exports = router;
