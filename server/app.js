const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const loggerMiddleware = require('./middleware/loggerMiddleware');
const errorMiddleware = require('./middleware/errorMiddleware');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*', 
  credentials: true
}));

const securityHeaders = require('./middleware/securityHeadersMiddleware');
const rateLimiter = require('./middleware/rateLimitMiddleware');
const nosqlSanitizer = require('./middleware/nosqlInjectionMiddleware');

app.use(securityHeaders);
app.use(rateLimiter(15 * 60 * 1000, 150)); // sliding window rate-limiting
app.use(nosqlSanitizer); // prevent nosql query injection attacks

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// HTTP Request Logger Middleware
app.use(loggerMiddleware);

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root Route
app.get('/', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Welcome to the ERP Portal API. Server is running successfully.',
    healthCheck: '/api/health'
  });
});

// Root API Route
app.get('/api', (req, res) => {
  res.status(200).json({ 
    success: true, 
    message: 'Welcome to the ERP Portal API.',
    healthCheck: '/api/health'
  });
});

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'ERP Portal server is healthy and running.' });
});

// Auth Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Lead Routes
app.use('/api/lead', require('./routes/leadRoutes'));

// Student Routes
app.use('/api/students', require('./routes/studentRoutes'));

// Fee Plan Routes
app.use('/api/fee-plan', require('./routes/feePlanRoutes'));

// Installment Routes
app.use('/api/installments', require('./routes/installmentRoutes'));

// Payment Routes
app.use('/api/payments', require('./routes/paymentRoutes'));

// Fees Dashboard Routes
app.use('/api/fees-dashboard', require('./routes/dashboardRoutes'));

// Reports Routes
app.use('/api/reports', require('./routes/reportRoutes'));

// Invoices Routes
app.use('/api/invoices', require('./routes/invoiceRoutes'));

// Receipts Routes
app.use('/api/receipts', require('./routes/receiptRoutes'));

// Settings Routes
app.use('/api/settings', require('./routes/settingsRoutes'));

// Notification Routes
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Employee Routes
app.use('/api/employee', require('./routes/employee/employeeRoutes'));
app.use('/api/employee/leaves', require('./routes/employee/leaveRoutes'));

// Admin Attendance/Employee Routes
app.use('/api/admin', require('./routes/admin/adminRoutes'));
app.use('/api/admin/leaves', require('./routes/admin/leaveRoutes'));

// Attendance Routes
app.use('/api/attendance', require('./routes/attendance/attendanceRoutes'));

// Certificate Routes
app.use('/api/certificates', require('./routes/certificate/certificateRoutes'));

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Global Error Handler Middleware (Clean Architecture)
app.use(errorMiddleware);

module.exports = app;
