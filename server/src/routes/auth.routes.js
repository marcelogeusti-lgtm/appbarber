const express = require('express');
const { register, login, getMe, changePassword, socialLogin, forgotPassword, resetPassword, switchBarbershop } = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', protect, changePassword);
router.post('/social-login', require('../controllers/auth.controller').socialLogin);
router.post('/forgot-password', require('../controllers/auth.controller').forgotPassword);
router.post('/reset-password', require('../controllers/auth.controller').resetPassword);
router.get('/me', protect, getMe);
router.post('/switch-barbershop', protect, switchBarbershop);

// --- 2FA & Security ---
const { setup2FA, enable2FA, disable2FA, getAuthStatus, getSessions, revokeSession } = require('../controllers/auth.controller');
router.post('/2fa/setup-request', protect, setup2FA);
router.post('/2fa/enable', protect, enable2FA);
router.post('/2fa/disable', protect, disable2FA);
router.get('/status', protect, getAuthStatus);

// --- Sessions ---
router.get('/sessions', protect, getSessions);
router.delete('/sessions/:sessionId', protect, revokeSession);

// --- Social account linking ---
const { linkSocial, unlinkSocial } = require('../controllers/auth.controller');
router.post('/link-social', protect, linkSocial);
router.post('/unlink-social', protect, unlinkSocial);

module.exports = router;
