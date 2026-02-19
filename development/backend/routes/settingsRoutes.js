const express = require('express');
const router = express.Router();
const settingsController = require('../controller/settingsController');
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');

// Public route to get settings (for website)
router.get('/', settingsController.getAllSettings);
router.get('/:key', settingsController.getSettingByKey);

// Protected routes to update settings (only for manager/admin)
router.put('/:key', authMiddleware, authorizeRole('manager', 'admin'), settingsController.updateSetting);

module.exports = router;
