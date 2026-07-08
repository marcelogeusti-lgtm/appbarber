const express = require('express');
const router = express.Router();
const ranking = require('../controllers/ranking.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.get('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), ranking.getRankings);

module.exports = router;
