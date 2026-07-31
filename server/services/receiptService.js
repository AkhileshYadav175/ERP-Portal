const receiptRepository = require('../repositories/receiptRepository');
const studentRepository = require('../repositories/studentRepository');
const { NotFoundError, BadRequestError } = require('../utils/customErrors');
const mongoose = require('mongoose');

/**
 * Receipt Service - Executes receipt lookup, pagination, and download updates.
 */
class ReceiptService {
  /**
   * Fetch a paginated lists of receipts.
   * @param {Object} queryParams - Search terms, payment mode, page indices.
   */
  async listReceipts(queryParams) {
    const { search, paymentMode, dateFilter, page = 1, limit = 20 } = queryParams;
    const query = {};

    // 1. Payment Mode Filter
    if (paymentMode && paymentMode !== 'All') {
      query.paymentMode = paymentMode;
    }

    // 2. Date Filters (Today, This Week, This Month)
    const now = new Date();
    if (dateFilter === 'today') {
      const start = new Date(now); start.setHours(0,0,0,0);
      const end = new Date(now); end.setHours(23,59,59,999);
      query.generatedDate = { $gte: start, $lte: end };
    } else if (dateFilter === 'week') {
      const start = new Date(now);
      const day = now.getDay();
      start.setDate(now.getDate() - day);
      start.setHours(0,0,0,0);
      query.generatedDate = { $gte: start };
    } else if (dateFilter === 'month') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      start.setHours(0,0,0,0);
      query.generatedDate = { $gte: start };
    }

    // 3. Global Search: Student Name, Student ID, Course, Receipt Number
    if (search && search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      const students = await studentRepository.aggregate([
        {
          $match: {
            deletedAt: null,
            $or: [
              { fullName: regex },
              { studentId: regex },
              { course: regex }
            ]
          }
        },
        { $project: { _id: 1 } }
      ]);
      const studentIds = students.map(s => s._id);

      query.$or = [
        { receiptNumber: regex },
        { studentId: { $in: studentIds } }
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const receipts = await receiptRepository.findAndPaginate(query, skip, parseInt(limit, 10));
    const total = await receiptRepository.count(query);

    return {
      receipts,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Fetch specific receipt by ID.
   * @param {string} id - Receipt DB ID.
   */
  async getReceiptDetails(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid Receipt ID path provided.');
    }
    const receipt = await receiptRepository.findById(id);
    if (!receipt) {
      throw new NotFoundError('Receipt record not found.');
    }
    return receipt;
  }

  /**
   * Simulate and register a receipt PDF download.
   * @param {string} id - Receipt DB ID.
   */
  async markReceiptDownloaded(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new BadRequestError('Invalid Receipt ID.');
    }
    const receipt = await receiptRepository.findById(id);
    if (!receipt) {
      throw new NotFoundError('Receipt record not found.');
    }
    
    receipt.downloadStatus = true;
    await receipt.save();

    return {
      fileUrl: `/receipts/download/${id}`,
      fileName: `${receipt.receiptNumber}.pdf`
    };
  }
}

module.exports = new ReceiptService();
