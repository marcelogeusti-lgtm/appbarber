const express = require('express');
const router = express.Router();
const c = require('../controllers/campaign.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect, authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/', c.list);
router.get('/preview', c.preview);
router.post('/', c.create);
router.post('/:id/send-batch', c.sendBatch);

module.exports = router;
