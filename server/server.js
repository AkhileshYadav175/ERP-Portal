const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    // Only start accepting requests once MongoDB is connected.
    // Without this, queries buffer and fail with a 500 buffering-timeout
    // which surfaces as a generic "login failed" error on the client.
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Fatal: port ${PORT} is already in use. Stop the other process or change PORT in .env.`);
      } else {
        console.error(`Fatal: could not start server - ${err.message}`);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error(`Fatal: could not connect to MongoDB - ${err.message}`);
    console.log('Restarting server after 5 seconds...');
    setTimeout(start, 5000);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Unhandled Rejection Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});

start();
