const express = require('express');
const router = express.Router();
const tutorialController = require('../controllers/tutorial.controller');
const { protect: authMiddleware } = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, tutorialController.list);

module.exports = router;
