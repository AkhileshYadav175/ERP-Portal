const mongoose = require('mongoose');

/**
 * FeesActivityLog Schema - Audit log for tracking all critical activities within the Fees Management module.
 * Logs actions, descriptions, operator IDs, and student references.
 */
const FeesActivityLogSchema = new mongoose.Schema(
  {
    // The action performed (e.g. 'PAYMENT_RECEIVED', 'INSTALLMENT_CREATED', etc.)
    action: {
      type: String,
      required: [true, 'Audited action type is required'],
      trim: true,
    },
    // Verbose description or details of the activity
    description: {
      type: String,
      required: [true, 'Audited activity description details are required'],
      trim: true,
    },
    // Reference to User who performed the action (Optional for system actions)
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Reference to the Student whom this activity concerns (Optional)
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      default: null,
      index: true,
    },
    // Explicit timestamp of the action
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// --- Virtual Relationships ---

// Virtual relationship referencing Student
FeesActivityLogSchema.virtual('student', {
  ref: 'Student',
  localField: 'studentId',
  foreignField: '_id',
  justOne: true,
});

// Virtual relationship referencing Operator (User)
FeesActivityLogSchema.virtual('operator', {
  ref: 'User',
  localField: 'performedBy',
  foreignField: '_id',
  justOne: true,
});

module.exports = mongoose.model('FeesActivityLog', FeesActivityLogSchema);
