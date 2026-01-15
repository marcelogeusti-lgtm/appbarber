const express = require('express');
const router = express.Router();
const waitlistController = require('../controllers/waitlist.controller');
const authMiddleware = require('../middlewares/auth'); // If needed, or specific routes

router.post('/', waitlistController.addToWaitlist); // Public? Or Auth? Assuming Public/Mixed for now as guest can join
router.get('/', waitlistController.getWaitlist);
router.delete('/:id', waitlistController.removeFromWaitlist);

module.exports = router;
