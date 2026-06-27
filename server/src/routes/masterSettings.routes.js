const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth.middleware');
const prisma = require('../lib/prisma');
const whatsappService = require('../services/communication/WhatsAppService');

// Middleware to ensure Master/Super Admin only
const ensureMaster = (req, res, next) => {
    if (req.user.role !== 'MASTER' && req.user.role !== 'OWNER' && req.user.role !== 'SUPERADMIN') {
        // Use standard roles that signify full platform access in this system.
        // Assuming OWNER/MASTER have super admin privileges.
        return res.status(403).json({ error: 'Access Denied. Super Admin only.' });
    }
    next();
};

// GET /api/master/settings
// Retrieve all global platform settings
router.get('/', protect, ensureMaster, async (req, res) => {
    try {
        const settings = await prisma.platformSetting.findMany();
        // Convert array to object { [key]: value }
        const settingsObj = {};
        for (const s of settings) {
            settingsObj[s.key] = s.value;
        }
        res.json(settingsObj);
    } catch (error) {
        console.error('Failed to get Platform Settings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/master/settings
// Update multiple global platform settings
router.post('/', protect, ensureMaster, async (req, res) => {
    try {
        const settingsToUpdate = req.body; // e.g. { WHATSAPP_API_URL: '...', WHATSAPP_API_TOKEN: '...' }
        
        if (!settingsToUpdate || typeof settingsToUpdate !== 'object') {
            return res.status(400).json({ error: 'Invalid payload' });
        }

        const keys = Object.keys(settingsToUpdate);
        
        // Upsert each setting
        for (const key of keys) {
            const value = settingsToUpdate[key];
            if (value !== undefined && value !== null) {
                await prisma.platformSetting.upsert({
                    where: { key },
                    update: { value: String(value) },
                    create: { key, value: String(value) }
                });
            }
        }

        // Inform WhatsAppService to refresh its config immediately
        whatsappService.refreshConfig();

        res.json({ message: 'Settings updated successfully' });
    } catch (error) {
        console.error('Failed to update Platform Settings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;
