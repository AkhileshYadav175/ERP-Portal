const mongoose = require('mongoose');
const Department = require('../models/Department');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp-portal');
    console.log(`MongoDB Connected: ${conn.connection.host}`);

    // Seed default departments if none exist
    try {
      const count = await Department.countDocuments();
      if (count === 0) {
        const defaultDepts = [
          { name: 'Human Resources', code: 'HR', description: 'HR department' },
          { name: 'Engineering', code: 'ENG', description: 'Engineering and Development' },
          { name: 'Sales & Marketing', code: 'MKT', description: 'Sales & Marketing' },
          { name: 'Operations', code: 'OPS', description: 'Operations management' }
        ];
        await Department.insertMany(defaultDepts);
        console.log('Seeded default departments.');
      }
    } catch (seedErr) {
      console.error('Failed to seed default departments:', seedErr.message);
    }
  } catch (error) {
    console.error(`Database Connection Error: ${error.message}`);
    // Do not crash the entire process during setup/testing in environments where MongoDB might not be running yet.
    console.log('Server is running, but database connection is pending. Make sure MongoDB is started.');
  }
};

module.exports = connectDB;
