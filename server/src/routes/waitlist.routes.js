const express = require('express');
const router = express.Router();
const waitlistController = require('../controllers/waitlist.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/', waitlistController.addToWaitlist);
router.get('/', protect, waitlistController.getWaitlist);

module.exports = router;
