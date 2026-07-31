const mongoose = require('mongoose');

/**
 * Invoice Schema - Represents a billing invoice document issued to a student for fees/installments.
 * Tracks invoice emission dates, payment due dates, specific installment mappings, and statuses.
 */
const InvoiceSchema = new mongoose.Schema(
  {
    // Auto-generated unique alphanumeric invoice number
    invoiceNumber: {
      type: String,
      unique: true,
      index: true,
    },
    // Reference to Student profile (indexed for performance)
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required'],
      index: true,
    },
    // Reference to specific Installment (if applicable)
    installmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Installment',
      default: null,
      index: true,
    },
    // Financial amount demanded on this invoice
    amount: {
      type: Number,
      required: [true, 'Invoice billing amount is required'],
      min: [0, 'Invoice amount cannot be negative'],
    },
    // Date of invoice issuance
    issueDate: {
      type: Date,
      default: Date.now,
    },
    // Expected payment due date
    dueDate: {
      type: Date,
      required: [true, 'Invoice payment due date is required'],
    },
    // Invoice status (PENDING, PAID, OVERDUE)
    status: {
      type: String,
      enum: {
        values: ['PENDING', 'PAID', 'OVERDUE'],
        message: '{VALUE} is not a valid invoice status',
      },
      default: 'PENDING',
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
InvoiceSchema.virtual('student', {
  ref: 'Student',
  localField: 'studentId',
  foreignField: '_id',
  justOne: true,
});

// Virtual relationship referencing specific Installment details
InvoiceSchema.virtual('installment', {
  ref: 'Installment',
  localField: 'installmentId',
  foreignField: '_id',
  justOne: true,
});

// Pre-save middleware to auto-generate sequential invoiceNumber (collision-free)
InvoiceSchema.pre('save', async function () {
  if (!this.invoiceNumber) {
    const currentYear = new Date().getFullYear();
    
    // Fetch dynamic prefix from settings
    const Settings = mongoose.model('Settings');
    const settingsDoc = await Settings.findOne({}) || { fee: { invoicePrefix: 'INV' } };
    const invoicePrefix = settingsDoc.fee?.invoicePrefix || 'INV';
    const prefix = `${invoicePrefix}-${currentYear}-`;
    
    // Find last invoice starting with this prefix
    const lastInvoice = await mongoose.models.Invoice.findOne({
      invoiceNumber: new RegExp(`^${prefix}`)
    }).sort({ invoiceNumber: -1 });

    let nextNum = 1;
    if (lastInvoice && lastInvoice.invoiceNumber) {
      const parts = lastInvoice.invoiceNumber.split('-');
      const lastNum = parseInt(parts[2], 10);
      if (!isNaN(lastNum)) {
        nextNum = lastNum + 1;
      }
    }
    
    const padded = String(nextNum).padStart(6, '0');
    this.invoiceNumber = `${prefix}${padded}`;
  }
});

module.exports = mongoose.model('Invoice', InvoiceSchema);
