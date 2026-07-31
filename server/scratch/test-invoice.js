const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load env from server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const serverDir = path.join(__dirname, '..');

// Load models
const Student = require(path.join(serverDir, 'models/Student'));
const FeePlan = require(path.join(serverDir, 'models/FeePlan'));
const Installment = require(path.join(serverDir, 'models/Installment'));
const Payment = require(path.join(serverDir, 'models/Payment'));
const Receipt = require(path.join(serverDir, 'models/Receipt'));
const Invoice = require(path.join(serverDir, 'models/Invoice'));
const User = require(path.join(serverDir, 'models/User'));
const Role = require(path.join(serverDir, 'models/Role'));

const runTests = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp-portal';
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to Database');

    // 1. Clear previous test invoices/receipts of the test sequence
    const currentYear = new Date().getFullYear();
    await Invoice.deleteMany({ invoiceNumber: new RegExp(`^INV-${currentYear}-`) });
    await Receipt.deleteMany({ receiptNumber: new RegExp(`^RCP-${currentYear}-`) });
    console.log('Cleared sequence test records.');

    // 2. Setup mock admin
    let adminUser = await User.findOne({});
    if (!adminUser) {
      let role = await Role.findOne({ name: 'Admin' });
      if (!role) {
        role = await Role.create({ name: 'Admin', description: 'Administrator' });
      }
      adminUser = await User.create({
        name: 'Test Admin',
        email: 'test_admin_inv@test.com',
        password: 'password123',
        role: role._id,
        status: 'active'
      });
    }

    // 3. Create mock student
    const mockStudent = await Student.create({
      fullName: 'Vicky Invoice',
      studentId: 'STU_INV_' + Date.now(),
      email: 'vicky.inv.' + Date.now() + '@example.com',
      mobile: '9876543111',
      fatherName: 'Bob Invoice',
      address: '456 Tech St',
      course: 'B.Tech',
      totalFees: 50000,
      paymentPlan: 'INSTALLMENT',
      status: 'ACTIVE',
      createdBy: adminUser._id
    });

    console.log('\n--- Running Year-based Sequential Numbers Tests ---');

    // Test 1: Invoices sequence check
    console.log('Creating Invoice #1...');
    const inv1 = await Invoice.create({
      studentId: mockStudent._id,
      amount: 15000,
      dueDate: new Date()
    });
    console.log('Invoice #1 Number:', inv1.invoiceNumber);
    if (!inv1.invoiceNumber.startsWith(`INV-${currentYear}-000001`)) {
      throw new Error('FAIL: Invoice #1 format incorrect!');
    }

    console.log('Creating Invoice #2...');
    const inv2 = await Invoice.create({
      studentId: mockStudent._id,
      amount: 15000,
      dueDate: new Date()
    });
    console.log('Invoice #2 Number:', inv2.invoiceNumber);
    if (!inv2.invoiceNumber.startsWith(`INV-${currentYear}-000002`)) {
      throw new Error('FAIL: Invoice #2 format incorrect!');
    }
    console.log('PASS: Invoice year-based sequential numbering generated successfully.');

    // Test 2: Receipts sequence check
    // Setup mock payment reference
    const mockPayment1 = await Payment.create({
      studentId: mockStudent._id,
      feePlanId: mockStudent._id, // dummy mapping for sequence
      amount: 10000,
      paymentMode: 'UPI',
      paymentType: 'INSTALLMENT_PAYMENT',
      paymentDate: new Date(),
      receivedBy: adminUser._id
    });

    const mockPayment2 = await Payment.create({
      studentId: mockStudent._id,
      feePlanId: mockStudent._id, // dummy mapping for sequence
      amount: 10000,
      paymentMode: 'Cash',
      paymentType: 'INSTALLMENT_PAYMENT',
      paymentDate: new Date(),
      receivedBy: adminUser._id
    });

    console.log('Creating Receipt #1...');
    const rec1 = await Receipt.create({
      paymentId: mockPayment1._id,
      studentId: mockStudent._id,
      amount: 10000,
      paymentMode: 'UPI'
    });
    console.log('Receipt #1 Number:', rec1.receiptNumber);
    if (!rec1.receiptNumber.startsWith(`RCP-${currentYear}-000001`)) {
      throw new Error('FAIL: Receipt #1 format incorrect!');
    }

    console.log('Creating Receipt #2...');
    const rec2 = await Receipt.create({
      paymentId: mockPayment2._id,
      studentId: mockStudent._id,
      amount: 10000,
      paymentMode: 'Cash'
    });
    console.log('Receipt #2 Number:', rec2.receiptNumber);
    if (!rec2.receiptNumber.startsWith(`RCP-${currentYear}-000002`)) {
      throw new Error('FAIL: Receipt #2 format incorrect!');
    }
    console.log('PASS: Receipt year-based sequential numbering generated successfully.');

    // Cleanup mock data
    console.log('\n--- Cleanup test records ---');
    await Student.deleteOne({ _id: mockStudent._id });
    await Invoice.deleteMany({ studentId: mockStudent._id });
    await Payment.deleteMany({ studentId: mockStudent._id });
    await Receipt.deleteMany({ studentId: mockStudent._id });
    console.log('Cleanup complete.');
    console.log('ALL INVOICE & RECEIPT SEQUENCE TESTS PASSED SUCCESSFULLY! 🧾💎');

  } catch (error) {
    console.error('TEST ERROR:', error);
  } finally {
    await mongoose.disconnect();
  }
};

runTests();
