const express = require('express');
const router = express.Router();
const r = require('../controllers/registry.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

router.use(protect, authorize('ADMIN', 'SUPER_ADMIN'));

['supplier', 'equipment', 'category'].forEach((entity) => {
    const base = `/${entity}`;
    router.get(base, r.list(entity));
    router.post(base, r.create(entity));
    router.put(`${base}/:id`, r.update(entity));
    router.delete(`${base}/:id`, r.remove(entity));
});

module.exports = router;
