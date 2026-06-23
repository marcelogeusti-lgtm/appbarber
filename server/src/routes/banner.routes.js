const express = require('express');
const router = express.Router({ mergeParams: true });
const { getBanners, createBanner, updateBanner, deleteBanner } = require('../controllers/banner.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/', authorize('ADMIN', 'SUPER_ADMIN'), getBanners);
router.post('/', authorize('ADMIN', 'SUPER_ADMIN'), createBanner);
router.put('/:bannerId', authorize('ADMIN', 'SUPER_ADMIN'), updateBanner);
router.delete('/:bannerId', authorize('ADMIN', 'SUPER_ADMIN'), deleteBanner);

module.exports = router;
