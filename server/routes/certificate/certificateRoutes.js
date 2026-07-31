const express = require('express');
const router = express.Router();
const {
  createCertificate,
  getCertificates,
  updateCertificate,
  deleteCertificate,
  verifyCertificate
} = require('../../controllers/certificate/certificateController');
const { protect } = require('../../middleware/authMiddleware');

// Public verification endpoint
router.get('/verify', verifyCertificate);

// Protected admin endpoints
router.post('/', protect, createCertificate);
router.get('/', protect, getCertificates);
router.put('/:id', protect, updateCertificate);
router.delete('/:id', protect, deleteCertificate);

module.exports = router;
