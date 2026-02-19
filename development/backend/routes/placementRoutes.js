const express = require('express');
const router = express.Router();
const placementController = require('../controller/placementController');

router.get('/', placementController.getAllPlacements);
router.post('/', placementController.createPlacement);
router.put('/:id', placementController.updatePlacement);
router.delete('/:id', placementController.deletePlacement);

module.exports = router;
