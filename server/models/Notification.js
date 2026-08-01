const mongoose = require('mongoose');

/**
 * Notification Schema - Represents ERP global notifications for all modules.
 * Fully compatible with both module-based and simple notification schemas.
 */
const NotificationSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true
    },
    module: {
      type: String,
      default: 'System'
    },
    type: {
      type: String,
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
      default: null
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    senderName: {
      type: String,
      default: ''
    },
    isAdmin: {
      type: Boolean,
      default: false
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

// Database indexes for fast querying
NotificationSchema.index({ targetUser: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });
NotificationSchema.index({ isAdmin: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);
