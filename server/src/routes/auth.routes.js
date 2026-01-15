const express = require('express');
const { register, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/social-login', require('../controllers/auth.controller').socialLogin);
router.post('/forgot-password', require('../controllers/auth.controller').forgotPassword);
router.get('/me', protect, getMe);

module.exports = router;
