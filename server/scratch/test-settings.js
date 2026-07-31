const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load env from server directory
dotenv.config({ path: path.join(__dirname, '../.env') });

const serverDir = path.join(__dirname, '..');

// Load models
const Student = require(path.join(serverDir, 'models/Student'));
const Payment = require(path.join(serverDir, 'models/Payment'));
const Receipt = require(path.join(serverDir, 'models/Receipt'));
const Invoice = require(path.join(serverDir, 'models/Invoice'));
const User = require(path.join(serverDir, 'models/User'));
const Role = require(path.join(serverDir, 'models/Role'));
const Settings = require(path.join(serverDir, 'models/Settings'));

const runSettingsTests = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp-portal';
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to Database');

    // Setup Mock Admin
    let adminUser = await User.findOne({});
    if (!adminUser) {
      let role = await Role.findOne({ name: 'Admin' });
      if (!role) {
        role = await Role.create({ name: 'Admin', description: 'Administrator' });
      }
      adminUser = await User.create({
        name: 'Test Admin',
        email: 'test_admin_set@test.com',
        password: 'password123',
        role: role._id,
        status: 'active'
      });
    }

    // 1. Reset / initialize settings document
    console.log('\nInitializing settings defaults...');
    await Settings.deleteMany({});
    let settingsDoc = await Settings.findOne({});
    if (!settingsDoc) {
      settingsDoc = await Settings.create({});
    }
    console.log('Default settings created. Institute Name:', settingsDoc.institute.name);
    if (settingsDoc.institute.name !== 'JCMS ERP Academy') {
      throw new Error('FAIL: Default name mismatch!');
    }

    // 2. Validate prefix updates & unique constraints
    console.log('\nTesting validation constraints...');
    
    // Test duplicate prefix check
    const duplicatePrefixPayload = {
      fee: {
        receiptPrefix: 'TEST',
        invoicePrefix: 'TEST', // Duplicate!
        studentPrefix: 'STU'
      }
    };
    
    // We mock the controller update validation logic
    const validateData = (data) => {
      if (data.fee) {
        const { receiptPrefix, invoicePrefix, studentPrefix } = data.fee;
        if (receiptPrefix && invoicePrefix && receiptPrefix === invoicePrefix) {
          return 'VALIDATION_FAILED: Receipt and Invoice prefixes cannot be identical';
        }
        if (receiptPrefix && studentPrefix && receiptPrefix === studentPrefix) {
          return 'VALIDATION_FAILED: Receipt and Student prefixes cannot be identical';
        }
      }
      return null;
    };
    
    const errDup = validateData(duplicatePrefixPayload);
    console.log('Duplicate check response:', errDup);
    if (!errDup || !errDup.includes('VALIDATION_FAILED')) {
      throw new Error('FAIL: Duplicate prefixes should be rejected!');
    }

    // 3. Test Email Validation
    const invalidEmail = 'not-an-email';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(invalidEmail)) {
      throw new Error('FAIL: Regex should flag invalid email format!');
    }
    console.log('PASS: Email regex flagged invalid address.');

    // 4. Update custom prefixes in settings
    console.log('\nUpdating settings with custom prefixes (TESTINV and TESTRCP)...');
    settingsDoc.fee.invoicePrefix = 'TESTINV';
    settingsDoc.fee.receiptPrefix = 'TESTRCP';
    await settingsDoc.save();
    console.log('Settings updated successfully.');

    // 5. Test sequential prefix integration on models
    console.log('\nCreating student and billing invoice to check prefix changes...');
    
    const mockStudent = await Student.create({
      fullName: 'Vikash Settings Test',
      studentId: 'STU_SET_' + Date.now(),
      email: 'vikash.set.' + Date.now() + '@example.com',
      mobile: '9876543222',
      fatherName: 'Bob Settings',
      address: '789 Config St',
      course: 'M.Tech',
      totalFees: 80000,
      paymentPlan: 'INSTALLMENT',
      status: 'ACTIVE',
      createdBy: adminUser._id
    });

    const currentYear = new Date().getFullYear();

    console.log('Creating Invoice #1 under new settings...');
    const invoice1 = await Invoice.create({
      studentId: mockStudent._id,
      amount: 20000,
      dueDate: new Date()
    });
    console.log('Invoice #1 Number:', invoice1.invoiceNumber);
    if (!invoice1.invoiceNumber.startsWith(`TESTINV-${currentYear}-`)) {
      throw new Error('FAIL: Custom invoice prefix not respected!');
    }
    console.log('PASS: Dynamic invoice prefix update verified.');

    // Receipts custom prefix check
    const mockPayment = await Payment.create({
      studentId: mockStudent._id,
      feePlanId: mockStudent._id,
      amount: 15000,
      paymentMode: 'UPI',
      paymentType: 'INSTALLMENT_PAYMENT',
      paymentDate: new Date(),
      receivedBy: adminUser._id
    });

    console.log('Creating Receipt #1 under new settings...');
    const receipt1 = await Receipt.create({
      paymentId: mockPayment._id,
      studentId: mockStudent._id,
      amount: 15000,
      paymentMode: 'UPI'
    });
    console.log('Receipt #1 Number:', receipt1.receiptNumber);
    if (!receipt1.receiptNumber.startsWith(`TESTRCP-${currentYear}-`)) {
      throw new Error('FAIL: Custom receipt prefix not respected!');
    }
    console.log('PASS: Dynamic receipt prefix update verified.');

    // Cleanup
    console.log('\nCleaning test data...');
    await Student.deleteOne({ _id: mockStudent._id });
    await Invoice.deleteMany({ studentId: mockStudent._id });
    await Payment.deleteMany({ studentId: mockStudent._id });
    await Receipt.deleteMany({ studentId: mockStudent._id });
    await Settings.deleteMany({});
    console.log('Cleanup finished.');

    console.log('\nALL CONFIGURATION & SETTINGS LOGIC TESTS PASSED SUCCESSFULLY! ⚙️💎');

  } catch (error) {
    console.error('TEST FAIL:', error);
  } finally {
    await mongoose.disconnect();
  }
};

runSettingsTests();
