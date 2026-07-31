const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Configure env variables
dotenv.config({ path: '/home/akhilesh-yadav/Management Workspace/ERP-Portal/server/.env' });

console.log('Starting end-to-end integration tests for the Installment Engine...');

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp-portal';
    await mongoose.connect(mongoUri);
    console.log('Database connected successfully.');

    // Import models, services and helpers
    const User = require('/home/akhilesh-yadav/Management Workspace/ERP-Portal/server/models/User');
    const Role = require('/home/akhilesh-yadav/Management Workspace/ERP-Portal/server/models/Role');
    const Student = require('/home/akhilesh-yadav/Management Workspace/ERP-Portal/server/models/Student');
    const FeePlan = require('/home/akhilesh-yadav/Management Workspace/ERP-Portal/server/models/FeePlan');
    const Installment = require('/home/akhilesh-yadav/Management Workspace/ERP-Portal/server/models/Installment');
    const FeesActivityLog = require('/home/akhilesh-yadav/Management Workspace/ERP-Portal/server/models/FeesActivityLog');
    
    const studentService = require('/home/akhilesh-yadav/Management Workspace/ERP-Portal/server/services/studentService');
    const feePlanService = require('/home/akhilesh-yadav/Management Workspace/ERP-Portal/server/services/feePlanService');
    const installmentService = require('/home/akhilesh-yadav/Management Workspace/ERP-Portal/server/services/installmentService');
    
    const { addMonths, getDueIndicator } = require('/home/akhilesh-yadav/Management Workspace/ERP-Portal/server/utils/dateHelper');

    // Fetch or create mock user
    let user = await User.findOne();
    if (!user) {
      let role = await Role.findOne();
      if (!role) {
        role = await Role.create({ name: 'Super Admin', description: 'Super Administrator' });
      }
      user = await User.create({
        name: 'Integration Test Admin',
        email: `test_admin_${Date.now()}@erp.com`,
        password: 'password123',
        role: role._id,
        status: 'active'
      });
    }
    const operatorId = user._id;

    // Clean up previous test entries
    await Student.deleteMany({ email: /@teststudent\.com$/ });
    await FeePlan.deleteMany({});
    await Installment.deleteMany({});
    console.log('Cleaned up previous test documents.');

    // Register Test Student (MCA)
    const student = await studentService.registerStudent({
      fullName: 'Vijay Kumar',
      fatherName: 'Raj Kumar',
      mobile: '+919999999201',
      email: 'vijay.kumar@teststudent.com',
      address: '123 Test Street, New Delhi',
      course: 'MCA',
      joiningDate: new Date(),
      totalFees: 50000,
      paymentPlan: 'INSTALLMENT'
    }, operatorId);

    // --- TEST 1: Automatic Installment Generation on Fee Plan Creation ---
    console.log('\n--- Test 1: Automatic Generation & Rounding Offset ---');
    const planData = {
      studentId: student._id,
      totalFees: 50000,
      paymentPlan: 'INSTALLMENT',
      numberOfInstallments: 12,
      firstDueDate: new Date('2026-01-31') // Target date with 31 days to verify month arithmetic
    };

    const feePlan = await feePlanService.setupFeePlan(planData, operatorId);
    console.log('Fee Plan created successfully.');

    // Verify installments count in DB
    const listData = await installmentService.listStudentInstallments(student._id);
    console.log(`Generated Installments count: ${listData.totalInstallments} (Expected: 12)`);
    if (listData.totalInstallments !== 12) {
      throw new Error('Fail: Installment count did not match plan numberOfInstallments.');
    }

    // Verify exact sum of all installment amounts equals totalFees (rounding check)
    let totalSum = 0;
    listData.installmentList.forEach((inst, index) => {
      totalSum += inst.amount;
      console.log(` - Installment #${inst.installmentNo} | Amount: ₹${inst.amount} | Due Date: ${inst.dueDate.toISOString().split('T')[0]}`);
    });
    console.log(`Sum of all installments: ₹${totalSum} (Expected total fees: ₹50000)`);
    if (totalSum !== 50000) {
      throw new Error(`Fail: Rounding offset mismatch! Total sum is ₹${totalSum} instead of ₹50000.`);
    } else {
      console.log('Pass: Rounded financial split sum matches totalFees exactly.');
    }

    // --- TEST 2: Reusable Date Arithmetic Helper & Leap Year checks ---
    console.log('\n--- Test 2: Calendar Date Math Arithmetic ---');
    
    // Check Jan 31 increment logic:
    // 1st (i=1): 2026-01-31
    // 2nd (i=2): 2026-02-28 (2026 is not a leap year)
    // 3rd (i=3): 2026-03-31
    // 4th (i=4): 2026-04-30
    const dates = listData.installmentList.map(inst => inst.dueDate.toISOString().split('T')[0]);
    if (dates[0] === '2026-01-31' && dates[1] === '2026-02-28' && dates[2] === '2026-03-31' && dates[3] === '2026-04-30') {
      console.log('Pass: Date arithmetic matches exact monthly offsets (Jan 31 -> Feb 28 -> Mar 31 -> Apr 30).');
    } else {
      throw new Error(`Fail: Date increments failed. Generated: ${dates.slice(0, 4)}`);
    }

    // Check Leap Year: Feb 2028 is a leap year (Feb 29)
    const baseLeapDate = new Date('2028-01-31');
    const incrementedLeap = addMonths(baseLeapDate, 1);
    const leapDateStr = incrementedLeap.toISOString().split('T')[0];
    console.log(`Leap Year Increment Check (2028-01-31 + 1 Month): ${leapDateStr}`);
    if (leapDateStr === '2028-02-29') {
      console.log('Pass: Leap year month end date calculated correctly.');
    } else {
      throw new Error(`Fail: Leap year failed. Expected 2028-02-29, got ${leapDateStr}`);
    }

    // --- TEST 3: Auto Status Checker & Upcoming Due Indicators ---
    console.log('\n--- Test 3: Auto Status Checker & Indicators ---');
    
    // Update first installment dueDate to past (yesterday) to trigger OVERDUE status check
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    await Installment.updateOne({ feePlanId: feePlan._id, installmentNo: 1 }, { dueDate: yesterday });

    // Update second installment dueDate to today to trigger "Due Today" indicator
    const today = new Date();
    await Installment.updateOne({ feePlanId: feePlan._id, installmentNo: 2 }, { dueDate: today });

    // Update third installment dueDate to 4 days from now to trigger "Upcoming" indicator
    const upcomingDate = new Date();
    upcomingDate.setDate(upcomingDate.getDate() + 4);
    await Installment.updateOne({ feePlanId: feePlan._id, installmentNo: 3 }, { dueDate: upcomingDate });

    // Fetch list again to trigger check
    const processedList = await installmentService.listStudentInstallments(student._id);
    const inst1 = processedList.installmentList.find(i => i.installmentNo === 1);
    const inst2 = processedList.installmentList.find(i => i.installmentNo === 2);
    const inst3 = processedList.installmentList.find(i => i.installmentNo === 3);

    console.log(` - Installment #1 Status: ${inst1.status} | Indicator: ${inst1.dueIndicator}`);
    console.log(` - Installment #2 Status: ${inst2.status} | Indicator: ${inst2.dueIndicator}`);
    console.log(` - Installment #3 Status: ${inst3.status} | Indicator: ${inst3.dueIndicator}`);

    if (inst1.status === 'OVERDUE' && inst1.dueIndicator === 'OVERDUE') {
      console.log('Pass: Auto Status Checker correctly updated overdue unpaid installment.');
    } else {
      throw new Error('Fail: Overdue checker failed.');
    }

    if (inst2.dueIndicator === 'Due Today') {
      console.log('Pass: Due Today indicator returned correctly.');
    } else {
      throw new Error('Fail: Due Today indicator failed.');
    }

    if (inst3.dueIndicator === 'Upcoming') {
      console.log('Pass: Upcoming indicator (within 7 days) returned correctly.');
    } else {
      throw new Error('Fail: Upcoming indicator failed.');
    }

    // --- TEST 4: Validation Lock on Update ---
    console.log('\n--- Test 4: Update Lock on Paid Installments ---');
    const targetInst = inst2; // Object ID of second installment
    
    // Attempt standard update
    const updatedInst = await installmentService.updateInstallment(targetInst._id, {
      dueDate: new Date('2026-09-10'),
      remarks: 'Admin corrected date'
    }, operatorId);
    console.log(`Updated Installment #${updatedInst.installmentNo} dueDate to: ${updatedInst.dueDate.toISOString().split('T')[0]}`);
    if (updatedInst.remarks === 'Admin corrected date') {
      console.log('Pass: Successfully updated active installment.');
    } else {
      throw new Error('Fail: Standard update failed.');
    }

    // Lock verification: Mock PAID status and verify block
    await Installment.updateOne({ _id: targetInst._id }, { status: 'PAID', paidAmount: targetInst.amount });
    try {
      await installmentService.updateInstallment(targetInst._id, {
        remarks: 'Trying to update paid installment'
      }, operatorId);
      throw new Error('Fail: Allowed editing fully paid installment!');
    } catch (err) {
      if (err.message.includes('PAID_LOCK')) {
        console.log('Pass: Correctly blocked updates on fully PAID installments.');
      } else {
        throw err;
      }
    }

    // --- TEST 5: Soft Delete ---
    console.log('\n--- Test 5: Soft Delete ---');
    const deletedInst = await installmentService.removeInstallment(inst3._id, operatorId);
    if (deletedInst.deletedAt !== null && String(deletedInst.deletedBy) === String(operatorId)) {
      console.log('Pass: Soft-deleted installment stamped correctly.');
    } else {
      throw new Error('Fail: Soft delete fields missing.');
    }

    // --- TEST 6: Activity Logging ---
    console.log('\n--- Test 6: Activity Log Auditing ---');
    const logs = await FeesActivityLog.find({ action: /INSTALLMENT/ }).sort({ createdAt: 1 });
    console.log(`Found ${logs.length} Installment Engine logs.`);
    logs.forEach(l => {
      console.log(` - Action: ${l.action} | Description: ${l.description}`);
    });

    const hasGen = logs.some(l => l.action === 'INSTALLMENTS_GENERATED');
    const hasUpd = logs.some(l => l.action === 'INSTALLMENT_UPDATED');
    const hasDel = logs.some(l => l.action === 'INSTALLMENT_DELETED');
    if (hasGen && hasUpd && hasDel) {
      console.log('Pass: Audit trail records checked successfully.');
    } else {
      throw new Error('Fail: Missing required audit logs.');
    }

    // Clean up
    console.log('\nCleaning up database records...');
    await Student.deleteMany({ email: /@teststudent\.com$/ });
    await FeePlan.deleteMany({});
    await Installment.deleteMany({});
    await FeesActivityLog.deleteMany({ action: /INSTALLMENT/ });
    console.log('SUCCESS: All integration tests passed cleanly.');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('\nFAILURE: Integration tests encountered an error:');
    console.error(error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

run();
