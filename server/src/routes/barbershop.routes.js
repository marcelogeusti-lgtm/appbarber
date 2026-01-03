const express = require('express');
const { getBarbershopBySlug, updateBarbershop, listBarbershops, searchBarbershops } = require('../controllers/barbershop.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { checkSubscription } = require('../middlewares/subscription.middleware');

const router = express.Router();

router.get('/', protect, authorize('SUPER_ADMIN'), listBarbershops);
router.get('/search', searchBarbershops);
router.get('/:slug', getBarbershopBySlug);
router.put('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), checkSubscription, updateBarbershop);

module.exports = router;
