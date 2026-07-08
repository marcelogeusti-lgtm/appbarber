const express = require('express');
const router = express.Router();
const coupon = require('../controllers/coupon.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

// Validar cupom pode ser chamado no fluxo de fechamento (autenticado)
router.get('/validate', protect, coupon.validate);
router.post('/validate', protect, coupon.validate);
router.post('/redeem', protect, coupon.redeem);

// Gestão (só dono/admin)
router.get('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), coupon.list);
router.post('/', protect, authorize('ADMIN', 'SUPER_ADMIN'), coupon.create);
router.put('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), coupon.update);
router.delete('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN'), coupon.remove);

module.exports = router;
