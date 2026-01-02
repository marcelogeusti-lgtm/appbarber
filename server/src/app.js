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
app.use('/api/waitlist', require('./routes/waitlist.routes'));
app.use('/api/subscriptions', require('./routes/subscription.routes'));
app.use('/api/commissions', require('./routes/commission.routes'));
app.use('/api/orders', require('./routes/order.routes'));
app.use('/api/products', require('./routes/product.routes'));

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

module.exports = app;
