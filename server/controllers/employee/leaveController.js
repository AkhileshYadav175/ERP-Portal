const Leave = require('../../models/Leave');
const Employee = require('../../models/Employee');
const Notification = require('../../models/Notification');

// @desc    Apply for a leave
// @route   POST /api/employee/leaves
// @access  Private (Employee)
exports.applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    const leave = await Leave.create({
      employee: req.employee._id,
      leaveType,
      startDate,
      endDate,
      reason,
      status: 'Pending'
    });

    // Create notification for admin
    const emp = await Employee.findById(req.employee._id);
    await Notification.create({
      isAdmin: true,
      senderName: `${emp.name} ${emp.lastName}`,
      message: `${emp.name} ${emp.lastName} applied for a ${leaveType} leave.`,
      type: 'leave_request'
    });

    return res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully.',
      leave
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get my leaves history
// @route   GET /api/employee/leaves
// @access  Private (Employee)
exports.getMyLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find({ employee: req.employee._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, leaves });
  } catch (err) {
    next(err);
  }
};
