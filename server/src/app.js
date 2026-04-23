const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Trigger deploy to sync loyalty database schema

// Import routes (placeholders for now)
const authRoutes = require('./routes/auth.routes');
const barbershopRoutes = require('./routes/barbershop.routes');
const serviceRoutes = require('./routes/service.routes');
const professionalRoutes = require('./routes/professional.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const financeRoutes = require('./routes/finance.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const productRoutes = require('./routes/product.routes');
const stockRoutes = require('./routes/stock.routes');
const orderRoutes = require('./routes/order.routes');

const waitlistRoutes = require('./routes/waitlist.routes');
const clientRoutes = require('./routes/client.routes'); // Assuming this is also needed based on the snippet

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get(['/', '/api'], (req, res) => {
    res.json({
        message: 'AppBarber Cloud API is running (Unified)',
        version: '1.0.0',
        timestamp: new Date(),
        v: 2
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/barbershops', barbershopRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/professionals', professionalRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/transactions', require('./routes/transaction.routes'));
app.use('/api/availability', require('./routes/availability.routes'));
app.use('/api/waitlist', waitlistRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/commissions', require('./routes/commission.routes'));
app.use('/api/orders', orderRoutes);
app.use('/api/products', productRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/addresses', require('./routes/address.routes'));
app.use('/api/clients', require('./routes/client.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

app.use('/api/webhooks', require('./routes/webhook.routes'));
app.use('/api/gateways', require('./routes/gateway.routes'));
app.use('/api/payments', require('./routes/payment.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));
app.use('/api/notifications/fcm', require('./routes/fcmToken.routes'));
app.use('/api/whatsapp', require('./routes/whatsapp.routes'));
app.use('/api/packages', require('./routes/package.routes'));
app.use('/api/feature-flags', require('./routes/featureFlag.routes'));
app.use('/api/rollout', require('./routes/rollout.routes'));
app.use('/api/rollout', require('./routes/rollout.routes'));
app.use('/api/loyalty', require('./routes/loyalty.routes'));
app.use('/api/reviews', require('./routes/review.routes'));
app.use('/api/tutorials', require('./routes/tutorial.routes'));
app.use('/api/nfes', require('./routes/nfe.routes'));
app.use('/api/support', require('./routes/support.routes'));
app.use('/api/import', require('./routes/import.routes'));
// app.use('/api/audit-logs', require('./routes/auditLog.routes')); // Future

// Initialize Notification Service (Listeners)
const notificationService = require('./services/notificationService');
notificationService.init();

// Initialize Appointment Event Listeners (WhatsApp Automation)
const appointmentListeners = require('./services/events/appointmentListeners');
appointmentListeners.init();

// Initialize Follow-up Event Listeners
const followUpListeners = require('./services/events/followUpListeners');
followUpListeners.init();

// Master / Educational Platform
app.use('/api', require('./routes/master.routes'));
app.use('/api', require('./routes/integration.routes'));

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

module.exports = app;
