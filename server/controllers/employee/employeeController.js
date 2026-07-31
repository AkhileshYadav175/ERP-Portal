const Employee = require('../../models/Employee');
const jwt = require('jsonwebtoken');
const Notification = require('../../models/Notification');

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

    // Create admin notification
    await Notification.create({
      isAdmin: true,
      senderName: `${employee.name} ${employee.lastName}`,
      message: `New employee registration request from ${employee.name} ${employee.lastName} (${employee.email})`,
      type: 'new_registration'
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
    const employee = await Employee.findOne({ email }).select('+password');
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
        designation: req.employee.designation || 'Employee',
        profilePicture: req.employee.profilePicture || ''
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update employee profile details
// @route   PUT /api/employee/me
// @access  Private
exports.updateEmployeeProfile = async (req, res, next) => {
  try {
    const { name, lastName, email, phone, profilePicture, password } = req.body;
    const employee = await Employee.findById(req.employee._id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found.' });
    }

    if (email && email !== employee.email) {
      const emailExists = await Employee.findOne({ email });
      if (emailExists) {
        return res.status(400).json({ success: false, message: 'An employee with this email already exists.' });
      }
      employee.email = email;
    }

    if (name) employee.name = name;
    if (lastName) employee.lastName = lastName;
    if (phone !== undefined) employee.phone = phone;
    if (profilePicture !== undefined) employee.profilePicture = profilePicture;
    if (password) {
      employee.password = password; // triggers pre-save hash hook
    }

    await employee.save();

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      employee: {
        id: employee._id,
        name: employee.name,
        lastName: employee.lastName,
        email: employee.email,
        phone: employee.phone,
        department: employee.department || '',
        designation: employee.designation || 'Employee',
        profilePicture: employee.profilePicture || ''
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get employee notifications
// @route   GET /api/employee/notifications
// @access  Private
exports.getEmployeeNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.employee._id }).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, notifications });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark employee notifications as read
// @route   PUT /api/employee/notifications/read
// @access  Private
exports.markEmployeeNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ recipient: req.employee._id, isRead: false }, { isRead: true });
    return res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) {
    next(err);
  }
};
