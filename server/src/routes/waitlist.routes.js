const express = require('express');
const router = express.Router();
const waitlistController = require('../controllers/waitlist.controller');
const { protect } = require('../middlewares/auth.middleware');
const { checkSubscription } = require('../middlewares/subscription.middleware');

router.post('/', waitlistController.addToWaitlist);
router.get('/', protect, checkSubscription, waitlistController.getWaitlist);

module.exports = router;
