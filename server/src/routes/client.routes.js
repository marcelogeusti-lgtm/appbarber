const express = require('express');
const router = express.Router();
const { listClients, getClientDetails, createClient } = require('../controllers/client.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/', authorize('ADMIN', 'SUPER_ADMIN', 'BARBER'), listClients);
router.post('/', authorize('ADMIN', 'SUPER_ADMIN', 'BARBER'), createClient);
router.get('/:id', authorize('ADMIN', 'SUPER_ADMIN', 'BARBER'), getClientDetails);

// Client Self-Management
const { updateClientProfile, deleteClient, toggleFavorite, getFavorites } = require('../controllers/client.controller');
router.put('/profile', authorize('CLIENT'), updateClientProfile);
router.post('/favorite', authorize('CLIENT'), toggleFavorite);
router.get('/favorites', authorize('CLIENT'), getFavorites);
router.delete('/:id', authorize('ADMIN', 'SUPER_ADMIN', 'BARBER'), deleteClient);

module.exports = router;
