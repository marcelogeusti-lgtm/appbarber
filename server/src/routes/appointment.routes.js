const express = require('express');
const { createAppointment, getMyAppointments, getProAppointments } = require('../controllers/appointment.controller');
const { protect, authorize } = require('../middlewares/auth.middleware');

const router = express.Router();

// router.post('/', protect, createAppointment); // User must be logged in? 
// We need optional auth. 
// Let's create a specific middleware or just remove protect and handle manual token check if needed, 
// OR simpler: have 2 endpoints or make the existing one handle both.
// Given strict "protect" middleware returns 401, we need to change it.
// Let's assume the frontend will NOT send token for guest. 
// We need a middleware that decodes token IF present, but doesn't error if missing.

const optionalProtect = async (req, res, next) => {
    const jwt = require('jsonwebtoken');
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
        } catch (error) {
            // Invalid token, treat as guest? Or error? 
            // Better to ignore if optional.
        }
    }
    next();
};

router.post('/', optionalProtect, createAppointment);
router.get('/me', protect, getMyAppointments); // Client history
router.get('/pro', protect, authorize('BARBER', 'ADMIN'), getProAppointments); // Pro View

module.exports = router;
