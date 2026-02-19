// ============================================================
// routes/advertisementRoutes.js
// PURPOSE: Advertisement management API routes
// ============================================================

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

/**
 * @swagger
 * /api/advertisements:
 *   post:
 *     summary: Create a new advertisement
 *     tags: [Advertisement]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - advertisementTitle
 *               - advertisementStartDate
 *               - advertisementEndDate
 *               - advertisementAdvertiserId
 *             properties:
 *               advertisementTitle:
 *                 type: string
 *               advertisementContent:
 *                 type: string
 *               advertisementImageUrl:
 *                 type: string
 *               advertisementStartDate:
 *                 type: string
 *                 format: date
 *               advertisementEndDate:
 *                 type: string
 *                 format: date
 *               advertisementAdvertiserId:
 *                 type: integer
 *               advertisementPlacementId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Advertisement created successfully
 */
router.post('/', authMiddleware, authorizeRole('advertiser', 'admin'), addAdvertisement);

/**
 * @swagger
 * /api/advertisements:
 *   get:
 *     summary: Get all advertisements
 *     tags: [Advertisement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, active, expired, rejected]
 *       - in: query
 *         name: advertiserId
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of advertisements
 */
router.get('/', authMiddleware, viewAllAdvertisement);

/**
 * @swagger
 * /api/advertisements/placements:
 *   get:
 *     summary: Get all advertisement placements
 *     tags: [Advertisement]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of ad placements
 */
router.get('/placement', authMiddleware, viewAdvertisementPlacements);

/**
 * @swagger
 * /api/advertisements/{advertisementId}:
 *   get:
 *     summary: Get advertisement by ID
 *     tags: [Advertisement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: advertisementId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Advertisement details with impressions and clicks
 */
router.get('/:advertisementId', authMiddleware, viewAdvertisement);

/**
 * @swagger
 * /api/advertisements/{advertisementId}:
 *   put:
 *     summary: Update advertisement
 *     tags: [Advertisement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: advertisementId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               advertisementTitle:
 *                 type: string
 *               advertisementContent:
 *                 type: string
 *               advertisementStatus:
 *                 type: string
 *                 enum: [pending, active, expired, rejected]
 *     responses:
 *       200:
 *         description: Advertisement updated successfully
 */
router.put('/:advertisementId', authMiddleware, updateAdvertisement);

/**
 * @swagger
 * /api/advertisements/{advertisementId}:
 *   delete:
 *     summary: Delete advertisement
 *     tags: [Advertisement]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: advertisementId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Advertisement deleted successfully
 */
router.delete('/:advertisementId', authMiddleware, authorizeRole('advertiser', 'admin'), deleteAdvertisement);

module.exports = router;
