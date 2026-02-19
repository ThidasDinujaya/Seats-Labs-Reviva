// ============================================================
// routes/campaignRoutes.js
// PURPOSE: Advertisement campaign management API routes
// ============================================================

const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');
const {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  addAdToCampaign
} = require('../controller/campaignController');

/**
 * @swagger
 * /api/campaigns:
 *   post:
 *     summary: Create a new ad campaign
 *     tags: [Campaigns]
 */
router.post('/', authMiddleware, authorizeRole('advertiser', 'admin'), createCampaign);

/**
 * @swagger
 * /api/campaigns:
 *   get:
 *     summary: Get all campaigns
 *     tags: [Campaigns]
 */
router.get('/', authMiddleware, getAllCampaigns);

/**
 * @swagger
 * /api/campaigns/{campaignId}:
 *   get:
 *     summary: Get campaign by ID with all ads
 *     tags: [Campaigns]
 */
router.get('/:campaignId', authMiddleware, getCampaignById);

/**
 * @swagger
 * /api/campaigns/{campaignId}:
 *   put:
 *     summary: Update campaign
 *     tags: [Campaigns]
 */
router.put('/:campaignId', authMiddleware, updateCampaign);

/**
 * @swagger
 * /api/campaigns/{campaignId}:
 *   delete:
 *     summary: Delete campaign
 *     tags: [Campaigns]
 */
router.delete('/:campaignId', authMiddleware, authorizeRole('advertiser', 'admin'), deleteCampaign);

/**
 * @swagger
 * /api/campaigns/{campaignId}/ads:
 *   post:
 *     summary: Add an ad to a campaign
 *     tags: [Campaigns]
 */
router.post('/:campaignId/ads', authMiddleware, authorizeRole('advertiser', 'admin'), addAdToCampaign);

module.exports = router;
