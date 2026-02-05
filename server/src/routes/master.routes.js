const express = require('express');
const router = express.Router();
const masterController = require('../controllers/master.controller');
const contentController = require('../controllers/content.controller');
const { protect: authMiddleware } = require('../middlewares/auth.middleware');

// Middleware to ensure SUPER_ADMIN
const requireMaster = (req, res, next) => {
    if (req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ message: 'Acesso negado. Apenas Master.' });
    }
    next();
};

// --- MASTER ROUTES (Protected) ---
router.use('/admin', authMiddleware, requireMaster);

// Courses
router.get('/admin/courses', masterController.listCourses);
router.post('/admin/courses', masterController.createCourse);
router.put('/admin/courses/:id', masterController.updateCourse);
router.delete('/admin/courses/:id', masterController.deleteCourse);

// Banners
router.get('/admin/banners', masterController.listBanners);
router.post('/admin/banners', masterController.createBanner);
router.put('/admin/banners/:id', masterController.updateBanner);
router.delete('/admin/banners/:id', masterController.deleteBanner);

// Updates
router.get('/admin/updates', masterController.listUpdates);
router.post('/admin/updates', masterController.createUpdate);
router.delete('/admin/updates/:id', masterController.deleteUpdate);


// --- CONTENT ROUTES (For Barbers) ---
router.use('/content', authMiddleware); // Any auth user (Barber/Admin/Master)

router.get('/content/courses', contentController.getCourses);
router.get('/content/banners', contentController.getBanners);
router.get('/content/updates', contentController.getUpdates);
router.post('/content/updates/read', contentController.markUpdateRead);

// Webhooks
router.post('/webhooks/kiwi', masterController.handleKiwiWebhook);

module.exports = router;
