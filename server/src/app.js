const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

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
const communicationRoutes = require('./routes/communication.routes');
const waitlistRoutes = require('./routes/waitlist.routes');
const clientRoutes = require('./routes/client.routes'); // Assuming this is also needed based on the snippet

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/', (req, res) => {
    res.json({
        message: 'AppBarber Cloud API is running',
        version: '1.0.0',
        timestamp: new Date()
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
app.use('/api/clients', require('./routes/client.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));
app.use('/api/communication', communicationRoutes);
app.use('/api/webhooks', require('./routes/webhook.routes'));
app.use('/api/notifications', require('./routes/notification.routes'));

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

module.exports = app;
