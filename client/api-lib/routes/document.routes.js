const express = require('express');
const router = express.Router();
const c = require('../controllers/document.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect, authorize('ADMIN', 'SUPER_ADMIN'));

router.get('/', c.list);
router.post('/', c.create);
router.delete('/:id', c.remove);

module.exports = router;
