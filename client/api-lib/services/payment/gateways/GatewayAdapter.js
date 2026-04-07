/**
 * Interface/Base Class for Payment Setup
 * All subsequent gateways must extend this and implement these methods.
 */
class GatewayAdapter {
    constructor() {
        if (this.constructor === GatewayAdapter) {
            throw new Error("Abstract classes can't be instantiated.");
        }
    }

    /**
     * Creates a payment (PIX, Credit Card, etc.)
     * @param {Object} params - { amount, method, description, customer: { name, email, taxId }, ... }
     * @returns {Promise<Object>} - { externalId, qrCode, qrCodeBase64, status, rawResponse }
     */
    async createPayment(params) {
        throw new Error("Method 'createPayment()' must be implemented.");
    }

    /**
     * Creates a subscription
     * @param {Object} params - { planId, customer: { email, sourceId }, ... }
     * @returns {Promise<Object>} - { subscriptionId, status }
     */
    async createSubscription(params) {
        throw new Error("Method 'createSubscription()' must be implemented.");
    }

    /**
     * Cancels a subscription
     * @param {String} subscriptionId
     * @returns {Promise<Boolean>}
     */
    async cancelSubscription(subscriptionId) {
        throw new Error("Method 'cancelSubscription()' must be implemented.");
    }

    /**
     * Validates Webhook Signature (Security)
     * @param {Object} req - Express request object
     * @returns {Boolean}
     */
    validateWebhook(req) {
        return true; // Default unsafe, override in subclass
    }
}

module.exports = GatewayAdapter;
