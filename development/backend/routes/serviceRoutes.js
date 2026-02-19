const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');
const {
  addService,
  viewService,
  viewAllService,
  updateService,
  deleteService
} = require('../controller/serviceController');

const {
    viewAllCategory,
    createCategory,
    updateCategory,
    deleteCategory
} = require('../controller/serviceCategoryController');

const {
    viewAllPackage,
    createPackage,
    updatePackage,
    deletePackage
} = require('../controller/servicePackageController');

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Service:
 *       type: object
 *       properties:
 *         serviceId:
 *           type: integer
 *         serviceName:
 *           type: string
 *         serviceDescription:
 *           type: string
 *         serviceDuration:
 *           type: integer
 *           description: Duration in minutes
 *         servicePrice:
 *           type: number
 *         serviceCategoryId:
 *           type: integer
 *         serviceIsActive:
 *           type: boolean
 */

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Add a new service (Admin only)
 *     tags: [Service]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceName
 *               - serviceDuration
 *               - servicePrice
 *             properties:
 *               serviceName:
 *                 type: string
 *                 example: Oil Change
 *               serviceDescription:
 *                 type: string
 *                 example: Complete oil change with filter replacement
 *               serviceDuration:
 *                 type: integer
 *                 example: 30
 *               servicePrice:
 *                 type: number
 *                 example: 2500.00
 *               serviceCategoryId:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Service created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
// ============================================================
// SERVICE ROUTES
// ============================================================
router.post('/', authMiddleware, authorizeRole('admin', 'manager'), addService);

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Get all active services
 *     tags: [Service]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of services
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Service'
 */
router.get('/', viewAllService);

/**
 * @swagger
 * /api/services/{serviceId}:
 *   get:
 *     summary: Get a single service by ID
 *     tags: [Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Service details
 *       404:
 *         description: Service not found
 */
router.get('/:serviceId', viewService);

/**
 * @swagger
 * /api/services/{serviceId}:
 *   put:
 *     summary: Update a service (Admin only)
 *     tags: [Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               serviceName:
 *                 type: string
 *               serviceDescription:
 *                 type: string
 *               serviceDuration:
 *                 type: integer
 *               servicePrice:
 *                 type: number
 *     responses:
 *       200:
 *         description: Service updated successfully
 *       404:
 *         description: Service not found
 */
router.put('/:serviceId', authMiddleware, authorizeRole('admin', 'manager'), updateService);

/**
 * @swagger
 * /api/services/{serviceId}:
 *   delete:
 *     summary: Delete a service (Admin only)
 *     tags: [Service]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: serviceId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Service deleted successfully
 *       404:
 *         description: Service not found
 */
router.delete('/:serviceId', authMiddleware, authorizeRole('admin', 'manager'), deleteService);

// ============================================================
// CATEGORY ROUTES
// ============================================================
router.get('/category/all', viewAllCategory);
router.post('/category', authMiddleware, authorizeRole('admin', 'manager'), createCategory);
router.put('/category/:id', authMiddleware, authorizeRole('admin', 'manager'), updateCategory);
router.delete('/category/:id', authMiddleware, authorizeRole('admin', 'manager'), deleteCategory);

// ============================================================
// PACKAGE ROUTES
// ============================================================
router.get('/package/all', viewAllPackage);
router.post('/package', authMiddleware, authorizeRole('admin', 'manager'), createPackage);
router.put('/package/:id', authMiddleware, authorizeRole('admin', 'manager'), updatePackage);
router.delete('/package/:id', authMiddleware, authorizeRole('admin', 'manager'), deletePackage);

module.exports = router;
