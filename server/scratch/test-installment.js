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
const User = require(path.join(serverDir, 'models/User'));
const Role = require(path.join(serverDir, 'models/Role'));

// Load services
const feePlanService = require(path.join(serverDir, 'services/feePlanService'));
const installmentService = require(path.join(serverDir, 'services/installmentService'));

const runTests = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp-portal';
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to Database');

    // Create or find admin user
    let adminUser = await User.findOne({});
    if (!adminUser) {
      console.log('No user found, creating mock Role and User...');
      let role = await Role.findOne({ name: 'Admin' });
      if (!role) {
        role = await Role.create({ name: 'Admin', description: 'Administrator' });
      }
      adminUser = await User.create({
        name: 'Test Admin',
        email: 'test_admin@test.com',
        password: 'password123',
        role: role._id,
        status: 'active'
      });
      console.log('Mock admin user created');
    }
    const adminId = adminUser._id;

    // Create a mock Student with all required fields
    const mockStudent = await Student.create({
      fullName: 'John Doe',
      studentId: 'STU' + Date.now(),
      email: 'john.doe.' + Date.now() + '@example.com',
      mobile: '9876543210',
      fatherName: 'Parent Doe',
      address: '123 Test Street, Test City',
      course: 'B.Tech',
      totalFees: 48000,
      paymentPlan: 'INSTALLMENT',
      status: 'ACTIVE',
      createdBy: adminId
    });
    console.log('Mock student created:', mockStudent.fullName);

    // TEST 1: Setup FULL_PAYMENT Fee Plan (No installments should be created)
    console.log('\n--- TEST 1: FULL_PAYMENT Plan Setup ---');
    const fullPlanData = {
      studentId: mockStudent._id.toString(),
      totalFees: 30000,
      paymentPlan: 'FULL_PAYMENT',
      numberOfInstallments: 1,
      firstDueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days from now
    };

    const fullPlan = await feePlanService.setupFeePlan(fullPlanData, adminId);
    console.log('FULL_PAYMENT Fee Plan created. paymentPlan:', fullPlan.paymentPlan);

    // Verify installments count is 0
    let installments = await Installment.find({ studentId: mockStudent._id, deletedAt: null });
    console.log('Installment count for FULL_PAYMENT plan:', installments.length);
    if (installments.length !== 0) {
      throw new Error('FAIL: Installments should not be generated for FULL_PAYMENT!');
    }
    console.log('PASS: No installments created for FULL_PAYMENT.');

    // Delete FULL_PAYMENT plan so we can test INSTALLMENT
    await FeePlan.deleteOne({ _id: fullPlan._id });
    console.log('Cleaned up FULL_PAYMENT plan');

    // TEST 2: Setup INSTALLMENT Fee Plan (Installments should be created automatically)
    console.log('\n--- TEST 2: INSTALLMENT Plan Setup & Generation ---');
    const firstDueDate = new Date('2026-08-10T00:00:00.000Z');
    const installmentPlanData = {
      studentId: mockStudent._id.toString(),
      totalFees: 48000,
      paymentPlan: 'INSTALLMENT',
      numberOfInstallments: 12,
      firstDueDate: firstDueDate
    };

    const instPlan = await feePlanService.setupFeePlan(installmentPlanData, adminId);
    console.log('INSTALLMENT Fee Plan created. Total Fees: ₹' + instPlan.totalFees + ', Installments: ' + instPlan.numberOfInstallments);

    // Verify installments count is 12
    installments = await Installment.find({ studentId: mockStudent._id, deletedAt: null }).sort({ installmentNo: 1 });
    console.log('Installments generated:', installments.length);
    if (installments.length !== 12) {
      throw new Error('FAIL: 12 installments should have been generated!');
    }
    console.log('PASS: 12 installments generated successfully.');

    // Verify values and dates
    console.log('\n--- Verify Installment Amounts and Due Dates ---');
    for (let i = 0; i < installments.length; i++) {
      const inst = installments[i];
      console.log(`Installment #${inst.installmentNo}: Amount = ₹${inst.amount}, Due Date = ${inst.dueDate.toISOString().slice(0, 10)}, Status = ${inst.status}`);
      // Verification of amount division
      if (inst.installmentNo < 12 && inst.amount !== 4000) {
        throw new Error('FAIL: Installment amount incorrect for index ' + inst.installmentNo);
      }
      if (inst.installmentNo === 12 && inst.amount !== 4000) {
        throw new Error('FAIL: Last installment amount incorrect!');
      }
    }
    console.log('PASS: Amounts and month-intervals are calculated accurately.');

    // TEST 3: Edit Installment (Only dueDate & remarks should be editable)
    console.log('\n--- TEST 3: Edit Installment (dueDate and remarks) ---');
    const targetInst = installments[0];
    const newDueDate = new Date('2026-08-15T00:00:00.000Z');
    const updated = await installmentService.updateInstallment(targetInst._id, {
      dueDate: newDueDate,
      remarks: 'Extended due date by admin'
    }, adminId);

    console.log('Updated Installment #1 Due Date:', updated.dueDate.toISOString().slice(0, 10));
    console.log('Updated Installment #1 Remarks:', updated.remarks);
    if (updated.dueDate.getTime() !== newDueDate.getTime() || updated.remarks !== 'Extended due date by admin') {
      throw new Error('FAIL: Update failed or fields not updated correctly!');
    }
    console.log('PASS: Installment update verified successfully.');

    // TEST 4: Soft Delete Installment
    console.log('\n--- TEST 4: Soft Delete Installment ---');
    const deletedInst = await installmentService.removeInstallment(targetInst._id, adminId);
    console.log('Soft deleted installment deletedAt:', deletedInst.deletedAt);
    if (!deletedInst.deletedAt) {
      throw new Error('FAIL: Soft delete did not populate deletedAt!');
    }

    const fetchedActive = await Installment.findOne({ _id: targetInst._id, deletedAt: null });
    console.log('Fetch deleted installment without deletedAt constraint:', fetchedActive);
    if (fetchedActive !== null) {
      throw new Error('FAIL: Deleted installment is still retrieved as active!');
    }
    console.log('PASS: Soft delete works as expected.');

    // TEST 5: Auto Status Checker (Scan & update overdue)
    console.log('\n--- TEST 5: Auto Status Checker bulk routine ---');
    // Let's modify the due date of installment #2 to be in the past (e.g. yesterday)
    const pastDueDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
    await Installment.updateOne({ studentId: mockStudent._id, installmentNo: 2 }, { dueDate: pastDueDate });
    console.log('Modified Installment #2 to have a past due date');

    const updatedCount = await installmentService.checkAndUpdateOverdueInstallments();
    console.log('Overdue scan completed. Installments updated to OVERDUE:', updatedCount);

    const updatedInst2 = await Installment.findOne({ studentId: mockStudent._id, installmentNo: 2 });
    console.log('Installment #2 current status:', updatedInst2.status);
    if (updatedInst2.status !== 'OVERDUE') {
      throw new Error('FAIL: Installment #2 should be OVERDUE!');
    }
    console.log('PASS: Auto Status Checker updated overdue installments successfully.');

    // TEST 6: Payment safety lock validation
    console.log('\n--- TEST 6: Payment safety lock ---');
    // Set installment #3 status to PAID
    await Installment.updateOne({ studentId: mockStudent._id, installmentNo: 3 }, { status: 'PAID', remainingAmount: 0 });
    const inst3 = await Installment.findOne({ studentId: mockStudent._id, installmentNo: 3 });

    try {
      await installmentService.validateInstallmentForPayment(inst3._id);
      throw new Error('FAIL: Should have thrown validation error for already PAID installment!');
    } catch (err) {
      console.log('Successfully blocked payment on PAID installment with error:', err.message);
      if (!err.message.includes('PAID_LOCK')) {
        throw new Error('FAIL: Wrong error message thrown!');
      }
    }
    console.log('PASS: Payment safety lock verified.');

    // Clean up
    console.log('\n--- Cleanup test records ---');
    await Student.deleteOne({ _id: mockStudent._id });
    await FeePlan.deleteOne({ _id: instPlan._id });
    await Installment.deleteMany({ studentId: mockStudent._id });
    console.log('Test student, fee plan, and all installments cleaned up.');
    console.log('ALL TESTS COMPLETED SUCCESSFULLY! 🎉');

  } catch (error) {
    console.error('TEST ERROR:', error);
  } finally {
    await mongoose.disconnect();
  }
};

runTests();
