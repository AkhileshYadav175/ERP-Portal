const FeesActivityLog = require('../models/FeesActivityLog');

/**
 * ActivityLog Repository - Manages database operations for administrative audit logs.
 */
class ActivityLogRepository {
  /**
   * Create an audit log record.
   * @param {Object} logData - Audit log details.
   * @param {Object|null} session - Transaction session if run within one.
   */
  async create(logData, session = null) {
    const options = session ? { session } : {};
    
    // Check if logData is an array to support batch logs inside sessions
    if (Array.isArray(logData)) {
      return await FeesActivityLog.create(logData, options);
    }
    
    const [log] = await FeesActivityLog.create([logData], options);
    return log;
  }

  /**
   * Find audit logs concerning a specific student.
   * @param {string} studentId - Student database Object ID.
   */
  async findByStudentId(studentId) {
    return await FeesActivityLog.find({ studentId })
      .sort({ createdAt: -1 })
      .populate('performedBy', 'name email')
      .lean();
  }

  /**
   * Find the most recent audit logs in the system.
   * @param {number} limit - Target number of logs.
   */
  async getRecent(limit = 15) {
    return await FeesActivityLog.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('performedBy', 'name email')
      .populate('studentId', 'fullName studentId')
      .lean();
  }
}

module.exports = new ActivityLogRepository();
