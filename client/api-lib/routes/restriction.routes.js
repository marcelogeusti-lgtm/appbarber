const express = require('express');
const router = express.Router();
const c = require('../controllers/restriction.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect, authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/', c.list);
router.post('/', c.block);
router.delete('/:id', c.unblock);

module.exports = router;
