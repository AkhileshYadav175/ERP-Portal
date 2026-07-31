const Notification = require('../models/Notification');

/**
 * Reusable Global Notification Service
 * Exposes core utility to raise notifications from any controller or system job.
 */
class NotificationService {
  /**
   * Create and dispatch a new notification
   * @param {Object} data - Notification fields
   */
  async create({
    title,
    message,
    module,
    type = 'INFO',
    priority = 'MEDIUM',
    referenceId = null,
    referenceType = null,
    createdBy = null,
    targetUser,
    actionUrl = '',
    icon = ''
  }) {
    try {
      if (!targetUser) {
        throw new Error('Target user is required to route the notification alert.');
      }

      const notification = await Notification.create({
        title,
        message,
        module,
        type,
        priority,
        referenceId,
        referenceType,
        createdBy,
        targetUser,
        actionUrl,
        icon
      });

      // Hook point for socket.io real-time broadcast and high priority email/SMS triggers
      this.dispatchEvent(notification);

      return notification;
    } catch (error) {
      console.error('NotificationService.create error:', error);
      throw error;
    }
  }

  /**
   * Broadcast dispatch logic (future-ready for Socket.io, SSE, push alert hooks)
   */
  dispatchEvent(notification) {
    // 1. Emit via socket.io global listener if attached
    // Example: global.io?.to(notification.targetUser.toString()).emit('new_notification', notification);

    // 2. Dispatch critical external triggers (Email/SMS/WhatsApp integrations)
    if (notification.priority === 'CRITICAL' || notification.priority === 'HIGH') {
      this.sendExternalAlerts(notification);
    }
  }

  async sendExternalAlerts(notification) {
    // SMS / Email integrations placeholder
    console.log(`[EXTERNAL DISPATCHER] Dispatching alert to targetUser ${notification.targetUser} with title: ${notification.title}`);
  }
}

module.exports = new NotificationService();
