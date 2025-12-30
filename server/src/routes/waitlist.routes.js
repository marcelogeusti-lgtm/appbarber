const express = require('express');
const router = express.Router();
const waitlistController = require('../controllers/waitlist.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/', waitlistController.addToWaitlist);
router.get('/', authMiddleware, waitlistController.getWaitlist);

module.exports = router;
