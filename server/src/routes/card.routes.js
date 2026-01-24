const express = require('express');
const router = express.Router();
const cardController = require('../controllers/card.controller');
const { protect } = require('../middlewares/auth.middleware');

router.get('/', protect, cardController.getCards);
router.post('/', protect, cardController.saveCard);
router.delete('/:id', protect, cardController.deleteCard);

module.exports = router;
