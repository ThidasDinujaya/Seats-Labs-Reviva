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

router.post('/', authMiddleware, authorizeRole('admin', 'manager'), addService);

router.get('/', viewAllService);

router.get('/:serviceId', viewService);

router.put('/:serviceId', authMiddleware, authorizeRole('admin', 'manager'), updateService);

router.delete('/:serviceId', authMiddleware, authorizeRole('admin', 'manager'), deleteService);

router.get('/category/all', viewAllCategory);
router.post('/category', authMiddleware, authorizeRole('admin', 'manager'), createCategory);
router.put('/category/:id', authMiddleware, authorizeRole('admin', 'manager'), updateCategory);
router.delete('/category/:id', authMiddleware, authorizeRole('admin', 'manager'), deleteCategory);

router.get('/package/all', viewAllPackage);
router.post('/package', authMiddleware, authorizeRole('admin', 'manager'), createPackage);
router.put('/package/:id', authMiddleware, authorizeRole('admin', 'manager'), updatePackage);
router.delete('/package/:id', authMiddleware, authorizeRole('admin', 'manager'), deletePackage);

module.exports = router;
