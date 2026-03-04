const express = require('express');
const router = express.Router();
const {
    listAddresses,
    getAddressById,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
} = require('../controllers/address.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect);
router.use(authorize('CLIENT'));

router.get('/', listAddresses);
router.get('/:id', getAddressById);
router.post('/', createAddress);
router.put('/:id', updateAddress);
router.delete('/:id', deleteAddress);
router.patch('/:id/default', setDefaultAddress);

module.exports = router;
