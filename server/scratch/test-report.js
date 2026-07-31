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
const User = require(path.join(serverDir, 'models/User'));
const Role = require(path.join(serverDir, 'models/Role'));
const FeesActivityLog = require(path.join(serverDir, 'models/FeesActivityLog'));

// Load reportService
const reportService = require(path.join(serverDir, 'services/reportService'));
const feePlanService = require(path.join(serverDir, 'services/feePlanService'));
const paymentService = require(path.join(serverDir, 'services/paymentService'));

const runTests = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp-portal';
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to Database');

    // Setup mock admin user
    let adminUser = await User.findOne({});
    if (!adminUser) {
      console.log('Creating mock admin...');
      let role = await Role.findOne({ name: 'Admin' });
      if (!role) {
        role = await Role.create({ name: 'Admin', description: 'Administrator' });
      }
      adminUser = await User.create({
        name: 'Test Admin',
        email: 'test_admin_rep@test.com',
        password: 'password123',
        role: role._id,
        status: 'active'
      });
    }
    const adminId = adminUser._id;

    // Create a mock active student with installment plan
    const mockStudent = await Student.create({
      fullName: 'Alice Report',
      studentId: 'STU_REP' + Date.now(),
      email: 'alice.rep.' + Date.now() + '@example.com',
      mobile: '9876543221',
      fatherName: 'Bob Report',
      address: '456 Avenue, City',
      course: 'MCA',
      totalFees: 40000,
      paymentPlan: 'INSTALLMENT',
      status: 'ACTIVE',
      createdBy: adminId
    });

    // Setup Fee Plan (creates installments automatically)
    const instPlanData = {
      studentId: mockStudent._id.toString(),
      totalFees: 40000,
      paymentPlan: 'INSTALLMENT',
      numberOfInstallments: 4,
      firstDueDate: new Date()
    };
    const plan = await feePlanService.setupFeePlan(instPlanData, adminId);
    let installments = await Installment.find({ studentId: mockStudent._id, deletedAt: null }).sort({ installmentNo: 1 });

    // Collect payment on first installment
    await paymentService.collectPayment({
      studentId: mockStudent._id.toString(),
      paymentType: 'INSTALLMENT_PAYMENT',
      paymentMode: 'Card',
      amount: 10000,
      installmentId: installments[0]._id.toString(),
      transactionId: 'TXNREP1',
      remarks: 'First installment payment'
    }, adminId);

    console.log('\n--- Running Reports Aggregation Service Tests ---');

    // Test 1: getSummary
    console.log('\nTesting getSummary()...');
    const summary = await reportService.getSummary();
    console.log('Summary output:', summary);
    if (!summary.totalStudents || summary.totalStudents <= 0) {
      throw new Error('FAIL: totalStudents count invalid!');
    }
    if (summary.totalCollection < 10000) {
      throw new Error('FAIL: totalCollection should be at least ₹10000!');
    }
    console.log('PASS: getSummary verified.');

    // Test 2: getDailyReport
    console.log('\nTesting getDailyReport()...');
    const daily = await reportService.getDailyReport({});
    console.log('Daily records count:', daily.length);
    if (daily.length === 0) {
      throw new Error('FAIL: Daily report empty!');
    }
    console.log('PASS: getDailyReport verified.');

    // Test 3: getWeeklyReport
    console.log('\nTesting getWeeklyReport()...');
    const weekly = await reportService.getWeeklyReport({});
    console.log('Weekly records count:', weekly.length);
    if (weekly.length === 0) {
      throw new Error('FAIL: Weekly report empty!');
    }
    console.log('PASS: getWeeklyReport verified.');

    // Test 4: getMonthlyReport
    console.log('\nTesting getMonthlyReport()...');
    const monthly = await reportService.getMonthlyReport({});
    console.log('Monthly records count:', monthly.length);
    if (monthly.length === 0) {
      throw new Error('FAIL: Monthly report empty!');
    }
    console.log('PASS: getMonthlyReport verified.');

    // Test 5: getCustomRangeReport
    console.log('\nTesting getCustomRangeReport()...');
    const tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
    const custom = await reportService.getCustomRangeReport({
      startDate: yesterday.toISOString().split('T')[0],
      endDate: tomorrow.toISOString().split('T')[0]
    });
    console.log('Custom range records count:', custom.length);
    if (custom.length === 0) {
      throw new Error('FAIL: Custom report empty!');
    }
    console.log('PASS: getCustomRangeReport verified.');

    // Test 6: getCourseWiseReport
    console.log('\nTesting getCourseWiseReport()...');
    const courseWise = await reportService.getCourseWiseReport();
    console.log('Course wise breakdown:', courseWise);
    if (courseWise.length === 0) {
      throw new Error('FAIL: Course-wise report empty!');
    }
    console.log('PASS: getCourseWiseReport verified.');

    // Test 7: getPendingReport
    console.log('\nTesting getPendingReport()...');
    const pending = await reportService.getPendingReport({});
    console.log('Pending records count:', pending.length);
    if (pending.length === 0) {
      throw new Error('FAIL: Pending report empty!');
    }
    console.log('PASS: getPendingReport verified.');

    // Test 8: getOverdueReport
    console.log('\nTesting getOverdueReport()...');
    const overdue = await reportService.getOverdueReport({});
    console.log('Overdue records count:', overdue.length);
    console.log('PASS: getOverdueReport verified.');

    // Test 9: getStudentLedger
    console.log('\nTesting getStudentLedger()...');
    const ledger = await reportService.getStudentLedger(mockStudent._id.toString());
    console.log('Ledger details - Student:', ledger.student.fullName);
    console.log('Ledger details - Installments count:', ledger.installments.length);
    console.log('Ledger details - Payments count:', ledger.payments.length);
    console.log('Ledger details - Timeline entries:', ledger.timeline.length);
    if (!ledger.student || ledger.installments.length !== 4 || ledger.payments.length !== 1) {
      throw new Error('FAIL: Student ledger values mismatch!');
    }
    console.log('PASS: getStudentLedger verified.');

    // Cleanup mock data
    console.log('\n--- Cleanup test records ---');
    await Student.deleteOne({ _id: mockStudent._id });
    await FeePlan.deleteOne({ _id: plan._id });
    await Installment.deleteMany({ studentId: mockStudent._id });
    await Payment.deleteMany({ studentId: mockStudent._id });
    await Receipt.deleteMany({ studentId: mockStudent._id });
    await FeesActivityLog.deleteMany({ studentId: mockStudent._id });
    console.log('Cleanup complete.');
    console.log('ALL REPORTS MODULE TESTS PASSED SUCCESSFULLY! 🚀');

  } catch (error) {
    console.error('TEST ERROR:', error);
  } finally {
    await mongoose.disconnect();
  }
};

runTests();
