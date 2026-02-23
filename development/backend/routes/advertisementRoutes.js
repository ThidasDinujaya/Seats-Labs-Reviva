const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');
const {
  addAdvertisement,
  viewAdvertisement,
  viewAllAdvertisement,
  updateAdvertisement,
  deleteAdvertisement,
  viewAdvertisementPlacements
} = require('../controller/advertisementController');

router.post('/', authMiddleware, authorizeRole('advertiser', 'admin'), addAdvertisement);

router.get('/', authMiddleware, viewAllAdvertisement);

router.get('/placement', authMiddleware, viewAdvertisementPlacements);

router.get('/:advertisementId', authMiddleware, viewAdvertisement);

router.put('/:advertisementId', authMiddleware, updateAdvertisement);

router.delete('/:advertisementId', authMiddleware, authorizeRole('advertiser', 'admin'), deleteAdvertisement);

module.exports = router;
