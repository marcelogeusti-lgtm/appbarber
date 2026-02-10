const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/review.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/', authMiddleware.protect, reviewController.createReview);
router.get('/', reviewController.getReviews); // Public or Auth? Usually public or mixed. Controller checks barbershopId.

module.exports = router;
