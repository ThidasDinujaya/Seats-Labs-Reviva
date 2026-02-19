// ============================================================
// routes/technicianRoutes.js
// PURPOSE: Technician management API routes
// ============================================================

const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');
const {
  addTechnician,
  viewTechnician,
  viewAllTechnicians,
  updateTechnician,
  deleteTechnician
} = require('../controller/technicianController');

/**
 * @swagger
 * /api/technicians:
 *   post:
 *     summary: Add a new technician (Admin only)
 *     tags: [Technicians]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - technicianFirstName
 *               - technicianLastName
 *               - userEmail
 *               - userPassword
 *             properties:
 *               technicianFirstName:
 *                 type: string
 *               technicianLastName:
 *                 type: string
 *               technicianPhone:
 *                 type: string
 *               technicianSpecialization:
 *                 type: string
 *               userEmail:
 *                 type: string
 *               userPassword:
 *                 type: string
 *     responses:
 *       201:
 *         description: Technician created successfully
 */
router.post('/', authMiddleware, authorizeRole('admin'), addTechnician);

/**
 * @swagger
 * /api/technicians:
 *   get:
 *     summary: Get all technicians
 *     tags: [Technicians]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of technicians
 */
router.get('/', authMiddleware, viewAllTechnicians);

/**
 * @swagger
 * /api/technicians/{technicianId}:
 *   get:
 *     summary: Get technician by ID
 *     tags: [Technicians]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: technicianId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Technician details
 */
router.get('/:technicianId', authMiddleware, viewTechnician);

/**
 * @swagger
 * /api/technicians/{technicianId}:
 *   put:
 *     summary: Update technician (Admin only)
 *     tags: [Technicians]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: technicianId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               technicianFirstName:
 *                 type: string
 *               technicianLastName:
 *                 type: string
 *               technicianPhone:
 *                 type: string
 *               technicianSpecialization:
 *                 type: string
 *     responses:
 *       200:
 *         description: Technician updated successfully
 */
router.put('/:technicianId', authMiddleware, authorizeRole('admin'), updateTechnician);

/**
 * @swagger
 * /api/technicians/{technicianId}:
 *   delete:
 *     summary: Delete technician (Admin only)
 *     tags: [Technicians]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: technicianId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Technician deleted successfully
 */
router.delete('/:technicianId', authMiddleware, authorizeRole('admin'), deleteTechnician);

module.exports = router;
