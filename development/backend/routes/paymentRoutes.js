const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');
const {
  createPayment,
  getInvoiceByBookingId,
  getInvoiceByAdId,
  getAllPayment,
  getAdvertiserPayment
} = require('../controller/paymentController');

router.post('/', authMiddleware, createPayment);
router.get('/', authMiddleware, authorizeRole('manager', 'admin'), getAllPayment);
router.get('/my', authMiddleware, authorizeRole('manager', 'advertiser'), getAdvertiserPayment);

router.get('/invoice/booking/:bookingId', authMiddleware, getInvoiceByBookingId);
router.get('/invoice/advertisement/:advertisementId', authMiddleware, getInvoiceByAdId);

module.exports = router;
