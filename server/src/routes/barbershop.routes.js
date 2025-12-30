const express = require('express');
const { getBarbershopBySlug, updateBarbershop, listBarbershops } = require('../controllers/barbershop.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', protect, authorize('SUPER_ADMIN'), listBarbershops);
router.get('/:slug', getBarbershopBySlug);
router.put('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), updateBarbershop);

module.exports = router;
