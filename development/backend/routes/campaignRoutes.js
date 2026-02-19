// ============================================================
// routes/campaignRoutes.js
// PURPOSE: Advertisement campaign management API routes
// ============================================================

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

/**
 * @swagger
 * /api/campaigns:
 *   post:
 *     summary: Create a new ad campaign
 *     tags: [Campaign]
 */
router.post('/', authMiddleware, authorizeRole('advertiser', 'admin'), createCampaign);

/**
 * @swagger
 * /api/campaigns:
 *   get:
 *     summary: Get all campaigns
 *     tags: [Campaign]
 */
router.get('/', authMiddleware, getAllCampaign);

/**
 * @swagger
 * /api/campaigns/{campaignId}:
 *   get:
 *     summary: Get campaign by ID with all ads
 *     tags: [Campaign]
 */
router.get('/:campaignId', authMiddleware, getCampaign);

/**
 * @swagger
 * /api/campaigns/{campaignId}:
 *   put:
 *     summary: Update campaign
 *     tags: [Campaign]
 */
router.put('/:campaignId', authMiddleware, updateCampaign);

/**
 * @swagger
 * /api/campaigns/{campaignId}:
 *   delete:
 *     summary: Delete campaign
 *     tags: [Campaign]
 */
router.delete('/:campaignId', authMiddleware, authorizeRole('advertiser', 'admin'), deleteCampaign);

/**
 * @swagger
 * /api/campaigns/{campaignId}/ads:
 *   post:
 *     summary: Add an ad to a campaign
 *     tags: [Campaign]
 */
router.post('/:campaignId/advertisement', authMiddleware, authorizeRole('advertiser', 'admin'), addAdToCampaign);

module.exports = router;
