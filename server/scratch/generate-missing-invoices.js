const mongoose = require('mongoose');
const path = require('path');

// Load environment variables if any
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/attendanceDB';

const Student = require('../models/Student');
const FeePlan = require('../models/FeePlan');
const Installment = require('../models/Installment');
const Invoice = require('../models/Invoice');
const Settings = require('../models/Settings');

async function run() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(mongoURI);
    console.log('Database connected successfully.');

    const feePlans = await FeePlan.find({});
    console.log(`Found ${feePlans.length} existing Fee Plans in the system.`);

    let createdCount = 0;

    for (const plan of feePlans) {
      const studentId = plan.studentId;
      
      // Check if student exists and is active
      const student = await Student.findById(studentId);
      if (!student) {
        console.log(`Skipping plan ${plan._id} - Student not found.`);
        continue;
      }

      if (plan.paymentPlan === 'INSTALLMENT') {
        const installments = await Installment.find({ studentId });
        console.log(`Student ${student.fullName} has ${installments.length} installments.`);

        for (const inst of installments) {
          // Check if invoice already exists for this installment
          const existingInvoice = await Invoice.findOne({ studentId, installmentId: inst._id });
          if (!existingInvoice) {
            await Invoice.create({
              studentId,
              installmentId: inst._id,
              amount: inst.amount,
              dueDate: inst.dueDate,
              status: inst.status === 'PAID' ? 'PAID' : 'PENDING'
            });
            createdCount++;
          }
        }
      } else {
        // FULL_PAYMENT
        const existingInvoice = await Invoice.findOne({ studentId, installmentId: null });
        if (!existingInvoice) {
          await Invoice.create({
            studentId,
            installmentId: null,
            amount: plan.totalFees,
            dueDate: plan.firstDueDate || new Date(),
            status: plan.status === 'PAID' ? 'PAID' : 'PENDING'
          });
          createdCount++;
        }
      }
    }

    console.log(`Successfully generated ${createdCount} missing invoices for existing fee plans!`);
    process.exit(0);
  } catch (err) {
    console.error('Invoice generation script failed:', err);
    process.exit(1);
  }
}

run();
