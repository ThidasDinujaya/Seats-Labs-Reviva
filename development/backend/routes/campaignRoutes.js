const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');
const {
  createCampaign,
  getAllCampaign,
  getCampaign,
  updateCampaign,
  deleteCampaign,
  addAdToCampaign
} = require('../controller/campaignController');

router.post('/', authMiddleware, authorizeRole('advertiser', 'admin'), createCampaign);

router.get('/', authMiddleware, getAllCampaign);

router.get('/:campaignId', authMiddleware, getCampaign);

router.put('/:campaignId', authMiddleware, updateCampaign);

router.delete('/:campaignId', authMiddleware, authorizeRole('advertiser', 'admin'), deleteCampaign);

router.post('/:campaignId/advertisement', authMiddleware, authorizeRole('advertiser', 'admin'), addAdToCampaign);

module.exports = router;
