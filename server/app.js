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
  origin: '*', 
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// HTTP Request Logger Middleware
app.use(loggerMiddleware);

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'ERP Portal server is healthy and running.' });
});

// Auth Routes
app.use('/api/auth', require('./routes/authRoutes'));

// Lead Routes
app.use('/api/lead', require('./routes/leadRoutes'));

// Employee Routes
app.use('/api/employee', require('./routes/employeeRoutes'));

// Admin Attendance/Employee Routes
app.use('/api/admin', require('./routes/adminRoutes'));

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'Resource not found' });
});

// Global Error Handler Middleware (Clean Architecture)
app.use(errorMiddleware);

module.exports = app;
