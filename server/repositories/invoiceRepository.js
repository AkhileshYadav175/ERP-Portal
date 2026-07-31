const Invoice = require('../models/Invoice');

/**
 * Invoice Repository - Handles database interactions for Invoice entities.
 */
class InvoiceRepository {
  /**
   * Create a new invoice record.
   * @param {Object} invoiceData - Invoice details.
   * @param {Object|null} session - Mongoose transaction session.
   */
  async create(invoiceData, session = null) {
    const options = session ? { session } : {};
    const [invoice] = await Invoice.create([invoiceData], options);
    return invoice;
  }

  /**
   * Find an invoice by query match.
   * @param {Object} query - Match filters.
   * @param {Object|null} session - Transaction session.
   */
  async findOne(query, session = null) {
    const q = Invoice.findOne(query);
    if (session) q.session(session);
    return await q;
  }

  /**
   * Find invoice by ID with populate.
   * @param {string} id - Invoice Object ID.
   */
  async findById(id) {
    return await Invoice.findById(id)
      .populate('studentId', 'fullName studentId course mobile email fatherName address feePlan')
      .populate('installmentId', 'installmentNo dueDate amount status');
  }

  /**
   * Find invoices with pagination and filters.
   * @param {Object} query - Filter parameters.
   * @param {number} skip - Offset skip count.
   * @param {number} limit - Max number of invoices to return.
   */
  async findAndPaginate(query, skip, limit) {
    return await Invoice.find(query)
      .sort({ issueDate: -1 })
      .skip(skip)
      .limit(limit)
      .populate('studentId', 'fullName studentId course mobile email')
      .populate('installmentId', 'installmentNo dueDate amount');
  }

  /**
   * Count documents matching a query filter.
   * @param {Object} filter - Query filter.
   */
  async count(filter = {}) {
    return await Invoice.countDocuments(filter);
  }
}

module.exports = new InvoiceRepository();
