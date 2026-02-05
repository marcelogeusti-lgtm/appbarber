const FeatureFlagService = require('../services/FeatureFlagService');

exports.getFlags = async (req, res) => {
    try {
        const { barbershopId } = req.query;
        // If not SUPER_ADMIN, enforce their own barbershopId
        const targetId = req.user.role === 'SUPER_ADMIN' ? barbershopId : req.user.barbershopId;

        const flags = await FeatureFlagService.getAllFlags(targetId);
        res.json(flags);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching flags' });
    }
};

exports.updateFlag = async (req, res) => {
    try {
        const { key, enabled, barbershopId, description } = req.body;

        // Only SUPER_ADMIN can set global flags (barbershopId = null)
        if (!barbershopId && req.user.role !== 'SUPER_ADMIN') {
            return res.status(403).json({ message: 'Only super admins can set global flags.' });
        }

        const flag = await FeatureFlagService.setFlag(key, enabled, barbershopId, description);
        res.json(flag);
    } catch (error) {
        res.status(500).json({ message: 'Error updating flag' });
    }
};

exports.checkFlag = async (req, res) => {
    try {
        const { key } = req.params;
        const { barbershopId } = req.query;
        const targetId = barbershopId || req.user?.barbershopId;

        const isEnabled = await FeatureFlagService.isEnabled(key, targetId);
        res.json({ key, enabled: isEnabled });
    } catch (error) {
        res.status(500).json({ message: 'Error checking flag' });
    }
};
