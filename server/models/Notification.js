const mongoose = require('mongoose');

/**
 * Notification Schema - Represents ERP global notifications for all modules.
 */
const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true
    },
    module: {
      type: String,
      enum: ['Attendance', 'Lead Management', 'Certificate Management', 'Fees Management', 'System'],
      required: [true, 'Module classification is required']
    },
    type: {
      type: String,
      enum: ['SUCCESS', 'INFO', 'WARNING', 'ERROR'],
      default: 'INFO'
    },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
      default: 'MEDIUM'
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    referenceType: {
      type: String,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    targetUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Target user is required']
    },
    isRead: {
      type: Boolean,
      default: false
    },
    readAt: {
      type: Date,
      default: null
    },
    actionUrl: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: ''
    }
  },
  { timestamps: true }
);

// Database indexes for fast querying on user feed sorting and read filtering
NotificationSchema.index({ targetUser: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
