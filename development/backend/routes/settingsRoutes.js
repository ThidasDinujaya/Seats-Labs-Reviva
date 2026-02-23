const express = require('express');
const router = express.Router();
const settingsController = require('../controller/settingsController');
const { authMiddleware, authorizeRole } = require('../middleware/authMiddleware');

router.get('/', settingsController.getAllSettings);
router.get('/:key', settingsController.getSettingByKey);

router.put('/:key', authMiddleware, authorizeRole('manager', 'admin'), settingsController.updateSetting);

module.exports = router;
