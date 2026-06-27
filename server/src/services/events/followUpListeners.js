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
    // 5. Subscription Renewal Warning
    eventBus.on('SUBSCRIPTION_RENEWAL_WARNING', async (payload) => {
        try {
            await communicationService.sendSubscriptionRenewalWarning(payload);
        } catch (error) {
            console.error('[Event Error] Failed to process SUBSCRIPTION_RENEWAL_WARNING:', error);
        }
    });

    // 6. Subscription Payment Failed
    eventBus.on('SUBSCRIPTION_PAYMENT_FAILED', async (payload) => {
        try {
            await communicationService.sendSubscriptionPaymentFailed(payload);
        } catch (error) {
            console.error('[Event Error] Failed to process SUBSCRIPTION_PAYMENT_FAILED:', error);
        }
    });

    // 7. Subscription Renewed Success
    eventBus.on('SUBSCRIPTION_RENEWED_SUCCESS', async (payload) => {
        try {
            await communicationService.sendSubscriptionRenewed(payload);
        } catch (error) {
            console.error('[Event Error] Failed to process SUBSCRIPTION_RENEWED_SUCCESS:', error);
        }
    });
}

module.exports = { init };
