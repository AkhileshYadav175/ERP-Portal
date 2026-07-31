const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Configure env variables
dotenv.config({ path: '/home/akhilesh-yadav/Management Workspace/ERP-Portal/server/.env' });

console.log('Starting end-to-end integration tests for Fee Plan Management Services...');

async function run() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/erp-portal';
    await mongoose.connect(mongoUri);
    console.log('Database connected successfully.');

    // Import models & services
    const User = require('/home/akhilesh-yadav/Management Workspace/ERP-Portal/server/models/User');
    const Role = require('/home/akhilesh-yadav/Management Workspace/ERP-Portal/server/models/Role');
    const Student = require('/home/akhilesh-yadav/Management Workspace/ERP-Portal/server/models/Student');
    const FeePlan = require('/home/akhilesh-yadav/Management Workspace/ERP-Portal/server/models/FeePlan');
    const FeesActivityLog = require('/home/akhilesh-yadav/Management Workspace/ERP-Portal/server/models/FeesActivityLog');
    const studentService = require('/home/akhilesh-yadav/Management Workspace/ERP-Portal/server/services/studentService');
    const feePlanService = require('/home/akhilesh-yadav/Management Workspace/ERP-Portal/server/services/feePlanService');

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
    console.log('Cleaned up previous test documents.');

    // Create Test Student 1 (MCA)
    const student1 = await studentService.registerStudent({
      fullName: 'John Doe',
      fatherName: 'Richard Doe',
      mobile: '+919999999101',
      email: 'john.doe@teststudent.com',
      address: '123 Test Street, New Delhi',
      course: 'MCA',
      joiningDate: new Date(),
      totalFees: 120000,
      paymentPlan: 'INSTALLMENT'
    }, operatorId);

    // Create Test Student 2 (BTech)
    const student2 = await studentService.registerStudent({
      fullName: 'Alice Smith',
      fatherName: 'Bob Smith',
      mobile: '+919999999102',
      email: 'alice.smith@teststudent.com',
      address: '456 Coding Lane, Bangalore',
      course: 'BTech CSE',
      joiningDate: new Date(),
      totalFees: 48000,
      paymentPlan: 'FULL_PAYMENT'
    }, operatorId);

    // --- TEST 1: Setup FULL_PAYMENT Fee Plan ---
    console.log('\n--- Test 1: Full Payment Plan Logic ---');
    const fullPlanData = {
      studentId: student2._id,
      totalFees: 48000,
      paymentPlan: 'FULL_PAYMENT'
    };

    const fullPlan = await feePlanService.setupFeePlan(fullPlanData, operatorId);
    if (
      fullPlan.numberOfInstallments === 1 &&
      fullPlan.installmentAmount === 48000 &&
      fullPlan.remainingAmount === 48000 &&
      fullPlan.paidAmount === 0 &&
      fullPlan.status === 'PENDING'
    ) {
      console.log('Pass: FULL_PAYMENT Fee Plan initialized with correct parameters:');
      console.log(` - Installments Count: ${fullPlan.numberOfInstallments}`);
      console.log(` - Installment Amount: ₹${fullPlan.installmentAmount}`);
      console.log(` - Remaining Amount: ₹${fullPlan.remainingAmount}`);
      console.log(` - Status: ${fullPlan.status}`);
    } else {
      throw new Error('Fail: FULL_PAYMENT properties mismatch.');
    }

    // --- TEST 2: Setup INSTALLMENT Fee Plan & Auto-Calculation ---
    console.log('\n--- Test 2: Installment Plan & Round-off Calculation ---');
    const installmentPlanData = {
      studentId: student1._id,
      totalFees: 48000,
      paymentPlan: 'INSTALLMENT',
      numberOfInstallments: 12,
      firstDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week from now
    };

    const instPlan = await feePlanService.setupFeePlan(installmentPlanData, operatorId);
    if (
      instPlan.numberOfInstallments === 12 &&
      instPlan.installmentAmount === 4000 && // 48000 / 12 = 4000
      instPlan.remainingAmount === 48000 &&
      instPlan.paidAmount === 0 &&
      instPlan.status === 'PENDING'
    ) {
      console.log('Pass: INSTALLMENT Fee Plan initialized and amount calculated successfully:');
      console.log(` - Installments Count: ${instPlan.numberOfInstallments}`);
      console.log(` - Calculated Installment Amount: ₹${instPlan.installmentAmount}`);
      console.log(` - First Due Date: ${instPlan.firstDueDate}`);
    } else {
      throw new Error('Fail: INSTALLMENT calculation properties mismatch.');
    }

    // Test decimal round off calculation (e.g. 50000 / 12 = 4166.666... -> 4167)
    console.log('Testing decimal rounding calculation (Total: 50000, Installments: 12)...');
    const testRoundingStudent = await studentService.registerStudent({
      fullName: 'Rounding Test Student',
      fatherName: 'Father Name',
      mobile: '+919999999103',
      email: 'rounding@teststudent.com',
      address: '789 Testing Rd, Pune',
      course: 'MCA',
      joiningDate: new Date(),
      totalFees: 50000,
      paymentPlan: 'INSTALLMENT'
    }, operatorId);

    const roundPlan = await feePlanService.setupFeePlan({
      studentId: testRoundingStudent._id,
      totalFees: 50000,
      paymentPlan: 'INSTALLMENT',
      numberOfInstallments: 12,
      firstDueDate: new Date()
    }, operatorId);
    
    if (roundPlan.installmentAmount === 4167) {
      console.log(`Pass: Correctly rounded 50000/12 to ₹${roundPlan.installmentAmount} (Mathematical round-off)`);
    } else {
      throw new Error(`Fail: Rounding calculated wrong amount: ₹${roundPlan.installmentAmount} (Expected 4167)`);
    }

    // --- TEST 3: Duplicate Active Fee Plan Prevention ---
    console.log('\n--- Test 3: Duplicate Active Plan Prevention ---');
    try {
      await feePlanService.setupFeePlan({
        studentId: student1._id,
        totalFees: 60000,
        paymentPlan: 'FULL_PAYMENT'
      }, operatorId);
      throw new Error('Fail: Allowed duplicate Fee Plan creation!');
    } catch (err) {
      if (err.message.includes('DUPLICATE_PLAN')) {
        console.log('Pass: Correctly rejected duplicate active Fee Plan.');
      } else {
        throw err;
      }
    }

    // --- TEST 4: Update Plan & Recalculation & Payment Lock ---
    console.log('\n--- Test 4: Update Plan & Payment Validation Lock ---');
    // Update plan totalFees and check recalculation
    const updatedPlan = await feePlanService.updateFeePlan(student1._id, {
      totalFees: 60000, // Change total fees to 60000 (Installments: 12 -> installmentAmount should become 5000)
      numberOfInstallments: 12
    }, operatorId);
    
    if (updatedPlan.totalFees === 60000 && updatedPlan.installmentAmount === 5000) {
      console.log('Pass: Successfully updated total fees and recalculated installment amount:');
      console.log(` - New Total: ₹${updatedPlan.totalFees}`);
      console.log(` - New Installment Amount: ₹${updatedPlan.installmentAmount}`);
    } else {
      throw new Error('Fail: Recalculation did not update correctly.');
    }

    // Test payment lock validation: Set paidAmount > 0 and try to update plan type
    await FeePlan.updateOne({ studentId: student1._id }, { paidAmount: 5000 });
    try {
      await feePlanService.updateFeePlan(student1._id, {
        paymentPlan: 'FULL_PAYMENT'
      }, operatorId);
      throw new Error('Fail: Allowed changing payment plan when payments exist!');
    } catch (err) {
      if (err.message.includes('PAYMENT_EXISTS')) {
        console.log('Pass: Correctly blocked payment plan change when paidAmount > 0.');
      } else {
        throw err;
      }
    }

    // --- TEST 5: Soft-Delete Plan ---
    console.log('\n--- Test 5: Soft-Delete Plan ---');
    const deletedPlan = await feePlanService.deleteFeePlan(student1._id, operatorId);
    if (
      deletedPlan.status === 'INACTIVE' &&
      deletedPlan.deletedAt !== null &&
      String(deletedPlan.deletedBy) === String(operatorId)
    ) {
      console.log('Pass: Soft delete parameters stamped successfully:');
      console.log(` - Status: ${deletedPlan.status}`);
      console.log(` - DeletedAt: ${deletedPlan.deletedAt}`);
      console.log(` - DeletedBy: ${deletedPlan.deletedBy}`);
    } else {
      throw new Error('Fail: Soft delete did not update parameters correctly.');
    }

    // --- TEST 6: Verify Activity Log records ---
    console.log('\n--- Test 6: Activity Log Auditing ---');
    const logs = await FeesActivityLog.find({ action: /FEE_PLAN/ }).sort({ createdAt: 1 });
    console.log(`Found ${logs.length} Fee Plan activity logs.`);
    logs.forEach(l => {
      console.log(` - Action: ${l.action} | Description: ${l.description}`);
    });

    const hasCreated = logs.some(l => l.action === 'FEE_PLAN_CREATED');
    const hasUpdated = logs.some(l => l.action === 'FEE_PLAN_UPDATED');
    const hasDeleted = logs.some(l => l.action === 'FEE_PLAN_DELETED');
    if (hasCreated && hasUpdated && hasDeleted) {
      console.log('Pass: All Fee Plan audit logs verified successfully.');
    } else {
      throw new Error('Fail: Missing required audit logs.');
    }

    // Clean up
    console.log('\nCleaning up database records...');
    await Student.deleteMany({ email: /@teststudent\.com$/ });
    await FeePlan.deleteMany({});
    await FeesActivityLog.deleteMany({ action: /FEE_PLAN/ });
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
