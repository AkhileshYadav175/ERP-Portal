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
const Payment = require(path.join(serverDir, 'models/Payment'));
const Receipt = require(path.join(serverDir, 'models/Receipt'));
const FeesActivityLog = require(path.join(serverDir, 'models/FeesActivityLog'));

// Load services
const feePlanService = require(path.join(serverDir, 'services/feePlanService'));
const paymentService = require(path.join(serverDir, 'services/paymentService'));

const runTests = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp-portal';
    console.log('Connecting to:', mongoUri);
    await mongoose.connect(mongoUri);
    console.log('Connected to Database');

    // Create or find admin user
    let adminUser = await User.findOne({});
    if (!adminUser) {
      console.log('Creating mock admin...');
      let role = await Role.findOne({ name: 'Admin' });
      if (!role) {
        role = await Role.create({ name: 'Admin', description: 'Administrator' });
      }
      adminUser = await User.create({
        name: 'Test Admin',
        email: 'test_admin_pay@test.com',
        password: 'password123',
        role: role._id,
        status: 'active'
      });
    }
    const adminId = adminUser._id;

    // Reset Receipt Counter to test RCP000001 format
    await Receipt.deleteMany({});
    console.log('Cleared all Receipts for sequential generation testing.');

    // Create active mock student
    const activeStudent = await Student.create({
      fullName: 'Alice Smith',
      studentId: 'STU' + Date.now(),
      email: 'alice.smith.' + Date.now() + '@example.com',
      mobile: '9876543211',
      fatherName: 'Bob Smith',
      address: '456 Lane, City',
      course: 'B.Tech',
      totalFees: 48000,
      paymentPlan: 'INSTALLMENT',
      status: 'ACTIVE',
      createdBy: adminId
    });

    // Create inactive mock student
    const inactiveStudent = await Student.create({
      fullName: 'Charlie Inactive',
      studentId: 'STU_IN' + Date.now(),
      email: 'charlie.' + Date.now() + '@example.com',
      mobile: '9876543212',
      fatherName: 'David Inactive',
      address: '789 Road, City',
      course: 'B.Tech',
      totalFees: 48000,
      paymentPlan: 'INSTALLMENT',
      status: 'INACTIVE',
      createdBy: adminId
    });

    // ----------------------------------------------------
    // TEST 1: Payment validation - Inactive Student
    // ----------------------------------------------------
    console.log('\n--- TEST 1: Inactive Student Validation ---');
    try {
      await paymentService.collectPayment({
        studentId: inactiveStudent._id.toString(),
        paymentType: 'PARTIAL_PAYMENT',
        paymentMode: 'Cash',
        amount: 5000
      }, adminId);
      throw new Error('FAIL: Should have blocked payment for inactive student!');
    } catch (err) {
      console.log('PASS: Successfully blocked inactive student payment with error:', err.message);
      if (!err.message.includes('VALIDATION_FAILED')) {
        throw new Error('FAIL: Wrong error type!');
      }
    }

    // ----------------------------------------------------
    // TEST 2: FULL_PAYMENT flow
    // ----------------------------------------------------
    console.log('\n--- TEST 2: FULL_PAYMENT Flow ---');
    // Setup a FULL_PAYMENT fee plan for Alice Smith (temporarily update Alice's plan classification)
    const fullPlanData = {
      studentId: activeStudent._id.toString(),
      totalFees: 30000,
      paymentPlan: 'FULL_PAYMENT',
      numberOfInstallments: 1,
      firstDueDate: new Date()
    };
    const fullPlan = await feePlanService.setupFeePlan(fullPlanData, adminId);

    // Try collecting FULL_PAYMENT
    const collectedFull = await paymentService.collectPayment({
      studentId: activeStudent._id.toString(),
      paymentType: 'FULL_PAYMENT',
      paymentMode: 'UPI',
      amount: 30000,
      transactionId: 'TXN10001',
      remarks: 'Paid full fees via UPI'
    }, adminId);

    console.log('Payment saved. Receipt generated:', collectedFull.receipt?.receiptNumber);
    if (!collectedFull.receipt?.receiptNumber.startsWith('RCP000001')) {
      throw new Error('FAIL: First receipt number should be RCP000001! Got: ' + collectedFull.receipt?.receiptNumber);
    }

    // Check fee plan status
    const updatedFullPlan = await FeePlan.findById(fullPlan._id);
    console.log('Fee Plan - Paid Amount:', updatedFullPlan.paidAmount, 'Remaining Amount:', updatedFullPlan.remainingAmount, 'Status:', updatedFullPlan.status);
    if (updatedFullPlan.status !== 'PAID' || updatedFullPlan.remainingAmount !== 0) {
      throw new Error('FAIL: Fee Plan should be PAID with remaining 0!');
    }
    console.log('PASS: FULL_PAYMENT flow verified successfully.');

    // Clean up Alice's FULL_PAYMENT plan so we can test INSTALLMENT plan
    await FeePlan.deleteOne({ _id: fullPlan._id });
    await Payment.deleteMany({ studentId: activeStudent._id });
    await Receipt.deleteMany({ studentId: activeStudent._id });
    await FeesActivityLog.deleteMany({ studentId: activeStudent._id });

    // Setup an INSTALLMENT plan for Alice
    const instPlanData = {
      studentId: activeStudent._id.toString(),
      totalFees: 48000,
      paymentPlan: 'INSTALLMENT',
      numberOfInstallments: 12,
      firstDueDate: new Date('2026-08-10')
    };
    const instPlan = await feePlanService.setupFeePlan(instPlanData, adminId);
    let installments = await Installment.find({ studentId: activeStudent._id, deletedAt: null }).sort({ installmentNo: 1 });

    // ----------------------------------------------------
    // TEST 3: INSTALLMENT_PAYMENT flow
    // ----------------------------------------------------
    console.log('\n--- TEST 3: INSTALLMENT_PAYMENT Flow ---');
    const targetInstallment = installments[0]; // Installment #1, amount = ₹4000
    const collectedInst = await paymentService.collectPayment({
      studentId: activeStudent._id.toString(),
      paymentType: 'INSTALLMENT_PAYMENT',
      paymentMode: 'Cash',
      amount: 4000,
      installmentId: targetInstallment._id.toString(),
      remarks: 'Paid 1st installment'
    }, adminId);

    console.log('Installment payment registered. Receipt number:', collectedInst.receipt?.receiptNumber);
    if (!collectedInst.receipt?.receiptNumber.startsWith('RCP000001')) {
      throw new Error('FAIL: Receipt number is not RCP000001!');
    }

    // Verify installment status is PAID, remaining is 0
    const updatedInst1 = await Installment.findById(targetInstallment._id);
    console.log('Installment #1 status:', updatedInst1.status, 'remaining:', updatedInst1.remainingAmount);
    if (updatedInst1.status !== 'PAID' || updatedInst1.remainingAmount !== 0) {
      throw new Error('FAIL: Installment #1 should be PAID with remaining 0!');
    }

    // Verify Fee Plan status is PARTIAL, remaining decreased by 4000
    const updatedPlanInst = await FeePlan.findById(instPlan._id);
    console.log('Fee Plan remaining:', updatedPlanInst.remainingAmount, 'status:', updatedPlanInst.status);
    if (updatedPlanInst.remainingAmount !== 44000 || updatedPlanInst.status !== 'PARTIAL') {
      throw new Error('FAIL: Fee Plan remaining amount should be 44000 and status PARTIAL!');
    }
    console.log('PASS: INSTALLMENT_PAYMENT flow verified successfully.');

    // ----------------------------------------------------
    // TEST 4: PARTIAL_PAYMENT on installment
    // ----------------------------------------------------
    console.log('\n--- TEST 4: PARTIAL_PAYMENT Flow ---');
    const installment2 = installments[1]; // Installment #2, amount = ₹4000
    const collectedPartial = await paymentService.collectPayment({
      studentId: activeStudent._id.toString(),
      paymentType: 'PARTIAL_PAYMENT',
      paymentMode: 'Card',
      amount: 1500,
      installmentId: installment2._id.toString(),
      remarks: 'Paid partial for 2nd installment'
    }, adminId);

    console.log('Partial payment registered. Receipt number:', collectedPartial.receipt?.receiptNumber);
    if (!collectedPartial.receipt?.receiptNumber.startsWith('RCP000002')) {
      throw new Error('FAIL: Receipt number is not RCP000002!');
    }

    const updatedInst2 = await Installment.findById(installment2._id);
    console.log('Installment #2 status:', updatedInst2.status, 'remaining:', updatedInst2.remainingAmount);
    if (updatedInst2.status !== 'PARTIAL' || updatedInst2.remainingAmount !== 2500) {
      throw new Error('FAIL: Installment #2 should be PARTIAL with remaining 2500!');
    }
    console.log('PASS: PARTIAL_PAYMENT flow verified successfully.');

    // ----------------------------------------------------
    // TEST 5: ADVANCE_PAYMENT (Seq allocation to upcoming installments)
    // ----------------------------------------------------
    console.log('\n--- TEST 5: ADVANCE_PAYMENT Flow ---');
    // Alice wants to pay ₹10,500 in advance.
    // Unpaid amounts are:
    // Installment #2: ₹2500 remaining (unpaid part)
    // Installment #3: ₹4000 remaining
    // Installment #4: ₹4000 remaining
    // Total unpaid up to #4 is exactly 2500 + 4000 + 4000 = 10,500!
    // So this payment of ₹10,500 should exactly pay off Installments #2, #3, and #4!
    const collectedAdvance = await paymentService.collectPayment({
      studentId: activeStudent._id.toString(),
      paymentType: 'ADVANCE_PAYMENT',
      paymentMode: 'Cheque',
      amount: 10500,
      transactionId: 'CHQ999123',
      remarks: 'Paid advance for next few installments'
    }, adminId);

    console.log('Advance payment registered. Receipt number:', collectedAdvance.receipt?.receiptNumber);
    if (!collectedAdvance.receipt?.receiptNumber.startsWith('RCP000003')) {
      throw new Error('FAIL: Receipt number is not RCP000003!');
    }

    const instsAfterAdvance = await Installment.find({ studentId: activeStudent._id, deletedAt: null }).sort({ installmentNo: 1 });
    console.log('Verification of Installments state after ADVANCE_PAYMENT:');
    for (let i = 0; i < 5; i++) {
      const inst = instsAfterAdvance[i];
      console.log(`Installment #${inst.installmentNo}: Status = ${inst.status}, Paid = ₹${inst.paidAmount}, Remaining = ₹${inst.remainingAmount}`);
    }

    // Inst 1: PAID, Inst 2: PAID, Inst 3: PAID, Inst 4: PAID, Inst 5: PENDING
    if (instsAfterAdvance[1].status !== 'PAID' || instsAfterAdvance[1].remainingAmount !== 0) {
      throw new Error('FAIL: Installment #2 should be PAID!');
    }
    if (instsAfterAdvance[2].status !== 'PAID' || instsAfterAdvance[2].remainingAmount !== 0) {
      throw new Error('FAIL: Installment #3 should be PAID!');
    }
    if (instsAfterAdvance[3].status !== 'PAID' || instsAfterAdvance[3].remainingAmount !== 0) {
      throw new Error('FAIL: Installment #4 should be PAID!');
    }
    if (instsAfterAdvance[4].status !== 'PENDING' || instsAfterAdvance[4].remainingAmount !== 4000) {
      throw new Error('FAIL: Installment #5 should be untouched (PENDING)!');
    }
    console.log('PASS: ADVANCE_PAYMENT sequentially allocated correctly.');

    // ----------------------------------------------------
    // TEST 6: Validation check - payment amount exceeds limit
    // ----------------------------------------------------
    console.log('\n--- TEST 6: Remaining amount limit validation ---');
    const activePlan = await FeePlan.findOne({ studentId: activeStudent._id });
    const currentRemaining = activePlan.remainingAmount; // should be 48000 - 4000 - 1500 - 10500 = 32000
    console.log('Current remaining balance in Fee Plan:', currentRemaining);

    try {
      await paymentService.collectPayment({
        studentId: activeStudent._id.toString(),
        paymentType: 'ADVANCE_PAYMENT',
        paymentMode: 'UPI',
        amount: currentRemaining + 1000
      }, adminId);
      throw new Error('FAIL: Should have blocked excess payment!');
    } catch (err) {
      console.log('PASS: Successfully blocked excess payment with error:', err.message);
      if (!err.message.includes('exceeds')) {
        throw new Error('FAIL: Wrong error message!');
      }
    }

    // Clean up
    console.log('\n--- Cleanup test records ---');
    await Student.deleteOne({ _id: activeStudent._id });
    await Student.deleteOne({ _id: inactiveStudent._id });
    await FeePlan.deleteOne({ _id: instPlan._id });
    await Installment.deleteMany({ studentId: activeStudent._id });
    await Payment.deleteMany({ studentId: activeStudent._id });
    await Receipt.deleteMany({ studentId: activeStudent._id });
    await FeesActivityLog.deleteMany({ studentId: activeStudent._id });
    console.log('Cleanup finished.');
    console.log('ALL TESTS PASSED SUCCESSFULLY! 💎');

  } catch (error) {
    console.error('TEST ERROR:', error);
  } finally {
    await mongoose.disconnect();
  }
};

runTests();
