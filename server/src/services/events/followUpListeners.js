const eventBus = require('./eventBus');
const communicationService = require('../communication/CommunicationService');
const notificationController = require('../../controllers/notification.controller');

function init() {
    console.log('[Events] Initializing FollowUpListeners...');

    // 1. Win-back
    eventBus.on('CLIENT_WINBACK', async (payload) => {
        try {
            await communicationService.sendWinbackMessage(payload);
        } catch (error) {
            console.error('[Event Error] Failed to process CLIENT_WINBACK:', error);
        }
    });

    // 2. Birthday
    eventBus.on('CLIENT_BIRTHDAY', async (payload) => {
        try {
            await communicationService.sendBirthdayMessage(payload);
        } catch (error) {
            console.error('[Event Error] Failed to process CLIENT_BIRTHDAY:', error);
        }
    });

    // 3. NPS Request
    eventBus.on('REQUEST_NPS', async (appointment) => {
        try {
            await communicationService.sendNPSRequest(appointment);
        } catch (error) {
            console.error('[Event Error] Failed to process REQUEST_NPS:', error);
        }
    });

    // 4. Package Expiring
    eventBus.on('PACKAGE_EXPIRING', async (payload) => {
        try {
            await communicationService.sendPackageExpiringMessage(payload);
        } catch (error) {
            console.error('[Event Error] Failed to process PACKAGE_EXPIRING:', error);
        }
    });
}

module.exports = { init };
