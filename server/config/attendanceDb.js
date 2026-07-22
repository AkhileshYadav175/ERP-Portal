const mongoose = require('mongoose');

const connString = process.env.ATTENDANCE_MONGO_URI;

if (!connString) {
  console.warn('ATTENDANCE_MONGO_URI not configured in env, falling back to main db connection.');
}

console.log('Initializing MongoDB Attendance DB Connection...');

const attendanceDB = connString 
  ? mongoose.createConnection(connString) 
  : mongoose.connection; // Fallback to default connection if not defined

attendanceDB.on('connected', () => {
  console.log('MongoDB Attendance Connection established successfully.');
});

attendanceDB.on('error', (err) => {
  console.error('MongoDB Attendance Connection Error:', err.message);
});

module.exports = attendanceDB;
