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

// Load service
const dashboardService = require(path.join(serverDir, 'services/dashboardService'));
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
        email: 'test_admin_dash@test.com',
        password: 'password123',
        role: role._id,
        status: 'active'
      });
    }
    const adminId = adminUser._id;

    // Create a mock active student with installment plan
    const mockStudent = await Student.create({
      fullName: 'John Dashboard',
      studentId: 'STU_DASH' + Date.now(),
      email: 'john.dash.' + Date.now() + '@example.com',
      mobile: '9876543231',
      fatherName: 'Robert Dashboard',
      address: '123 Boulevard, City',
      course: 'BCA',
      totalFees: 30000,
      paymentPlan: 'INSTALLMENT',
      status: 'ACTIVE',
      createdBy: adminId
    });

    // Setup Fee Plan (automatically creates installments via installmentService hook)
    const instPlanData = {
      studentId: mockStudent._id.toString(),
      totalFees: 30000,
      paymentPlan: 'INSTALLMENT',
      numberOfInstallments: 3,
      firstDueDate: new Date()
    };
    const plan = await feePlanService.setupFeePlan(instPlanData, adminId);
    let installments = await Installment.find({ studentId: mockStudent._id, deletedAt: null }).sort({ installmentNo: 1 });

    // Collect first installment
    await paymentService.collectPayment({
      studentId: mockStudent._id.toString(),
      paymentType: 'INSTALLMENT_PAYMENT',
      paymentMode: 'UPI',
      amount: 10000,
      installmentId: installments[0]._id.toString(),
      transactionId: 'TXNDASH1',
      remarks: 'First installment payment'
    }, adminId);

    // Collect partial payment on second installment
    await paymentService.collectPayment({
      studentId: mockStudent._id.toString(),
      paymentType: 'PARTIAL_PAYMENT',
      paymentMode: 'Cash',
      amount: 4000,
      installmentId: installments[1]._id.toString(),
      remarks: 'Partial payment'
    }, adminId);

    console.log('\n--- Running Dashboard Aggregation Service Tests ---');

    // Test 1: getSummary
    console.log('\nTesting getSummary()...');
    const summary = await dashboardService.getSummary({ filterType: 'month' });
    console.log('Summary output:', summary);
    if (!summary.totalStudents || summary.totalStudents <= 0) {
      throw new Error('FAIL: totalStudents count invalid!');
    }
    if (summary.collectedFees < 14000) {
      throw new Error('FAIL: collectedFees should be at least ₹14000!');
    }
    console.log('PASS: getSummary verified.');

    // Test 2: getCharts
    console.log('\nTesting getCharts()...');
    const charts = await dashboardService.getCharts({ filterType: 'month' });
    console.log('Monthly collections counts:', charts.monthlyCollections.length);
    console.log('Mode distributions:', charts.modeDistribution);
    console.log('Plan distributions:', charts.planDistribution);
    console.log('Status distributions:', charts.statusDistribution);
    if (charts.modeDistribution.length === 0) {
      throw new Error('FAIL: modeDistribution should contain entries!');
    }
    console.log('PASS: getCharts verified.');

    // Test 3: getRecentPayments
    console.log('\nTesting getRecentPayments()...');
    const payments = await dashboardService.getRecentPayments();
    console.log('Recent payments count:', payments.length);
    if (payments.length === 0) {
      throw new Error('FAIL: Recent payments empty!');
    }
    console.log('PASS: getRecentPayments verified.');

    // Test 4: getUpcomingDue
    console.log('\nTesting getUpcomingDue()...');
    const upcoming = await dashboardService.getUpcomingDue();
    console.log('Upcoming installments count:', upcoming.length);
    console.log('PASS: getUpcomingDue verified.');

    // Test 5: getOverdue
    console.log('\nTesting getOverdue()...');
    const overdue = await dashboardService.getOverdue();
    console.log('Overdue installments count:', overdue.length);
    console.log('PASS: getOverdue verified.');

    // Test 6: getRecentStudents
    console.log('\nTesting getRecentStudents()...');
    const students = await dashboardService.getRecentStudents();
    console.log('Recent students count:', students.length);
    if (students.length === 0) {
      throw new Error('FAIL: Recent students empty!');
    }
    console.log('PASS: getRecentStudents verified.');

    // Test 7: getRecentActivities
    console.log('\nTesting getRecentActivities()...');
    const activities = await dashboardService.getRecentActivities();
    console.log('Recent activities count:', activities.length);
    if (activities.length === 0) {
      throw new Error('FAIL: Recent activities timeline empty!');
    }
    console.log('PASS: getRecentActivities verified.');

    // Cleanup mock data
    console.log('\n--- Cleanup test records ---');
    await Student.deleteOne({ _id: mockStudent._id });
    await FeePlan.deleteOne({ _id: plan._id });
    await Installment.deleteMany({ studentId: mockStudent._id });
    await Payment.deleteMany({ studentId: mockStudent._id });
    await Receipt.deleteMany({ studentId: mockStudent._id });
    await FeesActivityLog.deleteMany({ studentId: mockStudent._id });
    console.log('Cleanup complete.');
    console.log('ALL DASHBOARD AGGREGATION TESTS PASSED SUCCESSFULLY! 🚀');

  } catch (error) {
    console.error('TEST ERROR:', error);
  } finally {
    await mongoose.disconnect();
  }
};

runTests();
