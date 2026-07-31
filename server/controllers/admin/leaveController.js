const Leave = require('../../models/Leave');
const Notification = require('../../models/Notification');

// @desc    Get all leave requests
// @route   GET /api/admin/leaves
// @access  Private (Admin only)
exports.getAllLeaves = async (req, res, next) => {
  try {
    const leaves = await Leave.find({})
      .populate('employee', 'name lastName email department')
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, leaves });
  } catch (err) {
    next(err);
  }
};

// @desc    Update leave request status (Approve / Reject)
// @route   PUT /api/admin/leaves/:id/status
// @access  Private (Admin only)
exports.updateLeaveStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    
    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value. Must be Approved or Rejected.' });
    }

    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    leave.status = status;
    leave.approvedBy = req.user ? req.user._id : undefined;
    await leave.save();

    // Create notification for employee
    await Notification.create({
      recipient: leave.employee,
      senderName: 'Admin',
      message: `Your leave request for ${leave.leaveType} leave has been ${status.toLowerCase()}.`,
      type: 'leave_result'
    });

    return res.status(200).json({
      success: true,
      message: `Leave request has been ${status.toLowerCase()} successfully.`,
      leave
    });
  } catch (err) {
    next(err);
  }
};
