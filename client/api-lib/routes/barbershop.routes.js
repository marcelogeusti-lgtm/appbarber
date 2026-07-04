const express = require('express');
const { getBarbershopBySlug, updateBarbershop, listBarbershops, searchBarbershops, getRecommendedBarbershops, updateSaasPlan, getMyBarbershop, getMyBarbershops, createAdditionalBarbershop, toggleFavorite, checkFavoriteStatus, getMyFavorites } = require('../controllers/barbershop.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { checkSubscription } = require('../middlewares/subscription.middleware');

const router = express.Router();

router.get('/', protect, authorize('SUPER_ADMIN'), listBarbershops);
router.get('/search', searchBarbershops);
router.get('/recommended', getRecommendedBarbershops);
router.get('/me', protect, getMyBarbershop);
router.get('/mine', protect, getMyBarbershops);
router.post('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), createAdditionalBarbershop);
router.get('/:slug', getBarbershopBySlug);
router.put('/:id/plan', protect, authorize('SUPER_ADMIN'), updateSaasPlan);
router.get('/:id/favorite-status', protect, checkFavoriteStatus);
router.post('/:id/favorite', protect, toggleFavorite);
router.get('/my/favorites', protect, getMyFavorites);
router.put('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), checkSubscription, updateBarbershop);

module.exports = router;
