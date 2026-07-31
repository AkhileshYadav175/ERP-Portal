const Payment = require('../models/Payment');

/**
 * Payment Repository - Handles data access operations for Payment records.
 * Supports running within database transaction sessions.
 */
class PaymentRepository {
  /**
   * Create a new payment record.
   * @param {Object} paymentData - Payment details.
   * @param {Object|null} session - Mongoose transaction session.
   */
  async create(paymentData, session = null) {
    const options = session ? { session } : {};
    const [payment] = await Payment.create([paymentData], options);
    return payment;
  }

  /**
   * Find a payment by ID.
   * @param {string} id - Payment database Object ID.
   */
  async findById(id) {
    return await Payment.findById(id)
      .populate('student', 'fullName studentId course')
      .populate('receivedBy', 'name email')
      .populate('receipt');
  }

  /**
   * Find all payments for a student.
   * @param {string} studentId - Student database Object ID.
   */
  async findByStudentId(studentId) {
    return await Payment.find({ studentId })
      .sort({ paymentDate: -1 })
      .populate('student', 'fullName studentId course')
      .populate('installment', 'installmentNo dueDate amount')
      .populate('receivedBy', 'name email')
      .populate('receipt');
  }

  /**
   * List all payments.
   */
  async findAll() {
    return await Payment.find({})
      .sort({ paymentDate: -1 })
      .populate('student', 'fullName studentId course')
      .populate('receivedBy', 'name email')
      .populate('receipt');
  }

  /**
   * Run custom aggregation pipelines.
   * @param {Array} pipeline - Aggregation pipeline.
   */
  async aggregate(pipeline) {
    return await Payment.aggregate(pipeline);
  }

  /**
   * Find payments matching a custom filter.
   * @param {Object} filter - Query filter.
   * @param {Object} sort - Sorting options.
   * @param {Object|null} session - Transaction session.
   */
  async find(filter, sort = {}, session = null) {
    const query = Payment.find(filter).sort(sort);
    if (session) query.session(session);
    return await query;
  }

  /**
   * Fetch recent payments in the system.
   * @param {number} limit - Target number of payments.
   */
  async getRecentPayments(limit = 10) {
    return await Payment.find({})
      .sort({ paymentDate: -1 })
      .limit(limit)
      .populate('studentId', 'fullName studentId course')
      .populate('receivedBy', 'name email')
      .populate('receipt');
  }
}

module.exports = new PaymentRepository();
