const express = require('express');
const router = express.Router();
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');
const {
  addTechnician,
  viewTechnician,
  viewAllTechnician,
  updateTechnician,
  deleteTechnician
} = require('../controller/technicianController');

router.post('/', authMiddleware, authorizeRole('admin'), addTechnician);

router.get('/', authMiddleware, viewAllTechnician);

router.get('/:technicianId', authMiddleware, viewTechnician);

router.put('/:technicianId', authMiddleware, authorizeRole('admin'), updateTechnician);

router.delete('/:technicianId', authMiddleware, authorizeRole('admin'), deleteTechnician);

module.exports = router;
