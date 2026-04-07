const express = require('express');
const NfeController = require('../controllers/NfeController');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/test', (req, res) => res.json({ status: 'Nfe Routes Active', v: 3 }));

// List all NFes for a shop
router.get('/shop/:barbershopId', protect, authorize('ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST'), NfeController.list);

// List my NFes (for client)
router.get('/me', protect, async (req, res) => {
    try {
        const NfeService = require('../services/NfeService');
        const nfes = await NfeService.listNfes({ clientId: req.user.id });
        res.json(nfes);
    } catch (error) {
        res.status(500).json({ error: 'Erro ao listar suas notas.' });
    }
});

// Get specific Nfe detail
router.get('/:id', protect, authorize('ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST', 'CLIENT'), NfeController.getById);

// Retry emission if error
router.post('/:id/retry', protect, authorize('ADMIN', 'SUPER_ADMIN'), NfeController.retry);

// Retroactive emission for closed orders
router.post('/retroactive/order/:orderId', protect, authorize('ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST'), NfeController.emitRetroactiveOrder);

// Retroactive emission for completed appointments
router.post('/retroactive/appointment/:appointmentId', protect, authorize('ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST'), NfeController.emitRetroactiveAppointment);

// Manual emission
router.post('/manual', protect, authorize('ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST'), NfeController.emitManual);

module.exports = router;
