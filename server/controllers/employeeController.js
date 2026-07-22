const Employee = require('../models/Employee');
const Attendance = require('../models/Attendance');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id, email) => {
  return jwt.sign(
    { id, email },
    process.env.JWT_SECRET || 'super_secret_erp_key_12345',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new employee
// @route   POST /api/employee/register
// @access  Public
exports.registerEmployee = async (req, res, next) => {
  try {
    const { name, lastName, email, phone, department, password, profilePicture } = req.body;

    if (!name || !lastName || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields.' });
    }

    // Check if employee email exists
    const employeeExists = await Employee.findOne({ email });
    if (employeeExists) {
      return res.status(400).json({ success: false, message: 'An employee with this email already exists.' });
    }

    // Create employee
    const employee = await Employee.create({
      name,
      lastName,
      email,
      phone,
      department: department || null,
      password,
      profilePicture: profilePicture || '',
      status: 'pending' // default status is pending approval
    });

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Your account is pending admin approval.',
      employee: {
        id: employee._id,
        name: employee.name,
        lastName: employee.lastName,
        email: employee.email,
        status: employee.status
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Login employee
// @route   POST /api/employee/login
// @access  Public
exports.loginEmployee = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    // Find employee and select password field
    const employee = await Employee.findOne({ email, role: 'employee' }).select('+password');
    if (!employee) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await employee.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check approval status
    if (employee.status === 'pending') {
      return res.status(403).json({
        success: false,
        message: 'Your account is pending admin approval. You can log in once approved.'
      });
    }

    if (employee.status !== 'active' && employee.status !== 'approved') {
      return res.status(403).json({
        success: false,
        message: `Your account is ${employee.status}. Access denied.`
      });
    }

    return res.status(200).json({
      success: true,
      token: generateToken(employee._id, employee.email),
      employee: {
        id: employee._id,
        name: employee.name,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        department: employee.department || '',
        profilePicture: employee.profilePicture || ''
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get current employee profile
// @route   GET /api/employee/me
// @access  Private
exports.getEmployeeProfile = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      employee: {
        id: req.employee._id,
        name: req.employee.name,
        lastName: req.employee.lastName,
        email: req.employee.email,
        phone: req.employee.phone,
        department: req.employee.department || '',
        profilePicture: req.employee.profilePicture || ''
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get today's check-in/out status
// @route   GET /api/employee/attendance/today
// @access  Private
exports.getTodayAttendance = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const attendance = await Attendance.findOne({
      employee: req.employee._id,
      date: { $gte: todayStart, $lte: todayEnd }
    });

    // Fetch last 10 days of attendance history for dashboard display
    const history = await Attendance.find({
      employee: req.employee._id
    })
      .sort({ date: -1 })
      .limit(10);

    return res.status(200).json({
      success: true,
      todayRecord: attendance,
      history
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark Check-In
// @route   POST /api/employee/attendance/checkin
// @access  Private
exports.checkInEmployee = async (req, res, next) => {
  try {
    const { remarks } = req.body;

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // Check if check-in already exists
    const existing = await Attendance.findOne({
      employee: req.employee._id,
      date: { $gte: todayStart, $lte: todayEnd }
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'You have already checked in today.' });
    }

    const checkInTime = new Date();
    const hours = checkInTime.getHours();
    const minutes = checkInTime.getMinutes();
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    // Late threshold: after 10:00 AM
    let status = 'Present';
    if (hours > 10 || (hours === 10 && minutes > 0)) {
      status = 'Late';
    }

    const attendance = await Attendance.create({
      employee: req.employee._id,
      date: checkInTime,
      status,
      checkIn: timeStr,
      remarks: remarks || ''
    });

    return res.status(201).json({
      success: true,
      message: status === 'Late' ? 'Checked in late successfully.' : 'Checked in successfully.',
      record: attendance
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark Check-Out
// @route   POST /api/employee/attendance/checkout
// @access  Private
exports.checkOutEmployee = async (req, res, next) => {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const attendance = await Attendance.findOne({
      employee: req.employee._id,
      date: { $gte: todayStart, $lte: todayEnd }
    });

    if (!attendance) {
      return res.status(400).json({ success: false, message: 'You must check-in first before checking out.' });
    }

    if (attendance.checkOut) {
      return res.status(400).json({ success: false, message: 'You have already checked out today.' });
    }

    const checkOutTime = new Date();
    const hours = checkOutTime.getHours();
    const minutes = checkOutTime.getMinutes();
    const timeStr = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    attendance.checkOut = timeStr;
    await attendance.save();

    return res.status(200).json({
      success: true,
      message: 'Checked out successfully.',
      record: attendance
    });
  } catch (err) {
    next(err);
  }
};
