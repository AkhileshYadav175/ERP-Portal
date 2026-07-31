const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Please associate an employee']
    },
    date: {
      type: Date,
      required: [true, 'Please specify attendance date']
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Leave', 'Late', 'Holiday', 'Half Day'],
      default: 'Present'
    },
    checkIn: {
      type: String,
      default: ''
    },
    checkOut: {
      type: String,
      default: ''
    },
    remarks: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Attendance', AttendanceSchema);
