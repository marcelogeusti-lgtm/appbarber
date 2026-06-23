const express = require('express');
const { getBarbershopBySlug, updateBarbershop, listBarbershops, searchBarbershops, getRecommendedBarbershops, updateSaasPlan, getMyBarbershop, toggleFavorite, checkFavoriteStatus, getMyFavorites, cancelMySaasSubscription } = require('../controllers/barbershop.controller');
const bannerRoutes = require('./banner.routes');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { checkSubscription } = require('../middlewares/subscription.middleware');

const router = express.Router();

router.get('/', protect, authorize('SUPER_ADMIN'), listBarbershops);
router.get('/search', searchBarbershops);
router.get('/recommended', getRecommendedBarbershops);
router.get('/me', protect, getMyBarbershop);
router.get('/:slug', getBarbershopBySlug);
router.put('/:id/plan', protect, authorize('SUPER_ADMIN'), updateSaasPlan);
router.get('/:id/favorite-status', protect, checkFavoriteStatus);
router.post('/:id/favorite', protect, toggleFavorite);
router.get('/my/favorites', protect, getMyFavorites);
router.post('/cancel-saas', protect, authorize('ADMIN'), cancelMySaasSubscription);
router.put('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), checkSubscription, updateBarbershop);

// Nested routes
router.use('/:id/banners', bannerRoutes);

module.exports = router;
