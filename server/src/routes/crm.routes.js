const express = require('express');
const router = express.Router();
const crmController = require('../controllers/crm.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.use(authMiddleware);

router.get('/clients', crmController.getClients); // ?barbershopId=...&status=...
router.patch('/clients/notes', crmController.updateClientNotes);

module.exports = router;
