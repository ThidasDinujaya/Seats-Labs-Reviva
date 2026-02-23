const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  addBooking,
  viewBooking,
  viewAllBooking,
  updateBooking,
  cancelBooking
} = require('../controller/bookingController');

router.post('/', authMiddleware, addBooking);

router.get('/', authMiddleware, viewAllBooking);

router.get('/:bookingId', authMiddleware, viewBooking);

router.put('/:bookingId', authMiddleware, updateBooking);

router.delete('/:bookingId', authMiddleware, cancelBooking);

module.exports = router;
