const express = require('express');
const router = express.Router();
const trackingController = require('../controller/trackingController');

router.get('/', trackingController.getServiceTracking);

router.get('/history/:bookingId', trackingController.getHistory);
router.post('/update', trackingController.updateStatus);

module.exports = router;
