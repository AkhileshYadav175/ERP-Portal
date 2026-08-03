const authService = require('../services/authService');

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Please provide an email and password' });
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const authData = await authService.authenticate(cleanEmail, password);
    return res.status(200).json({
      success: true,
      token: authData.token,
      user: authData.user
    });
  } catch (error) {
    console.error('Login controller error:', error.message);
    const status = error.message.includes('inactive') ? 403 : 401;
    return res.status(status).json({ success: false, message: error.message });
  }
};

// @desc    Get current logged in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
};

// @desc    Logout user / clear token API
// @route   POST /api/auth/logout
// @access  Private
exports.logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Change authenticated user's password
// @route   POST /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Current password and new password are required.' });
  }

  try {
    const result = await authService.changePassword(req.user.id, currentPassword, newPassword);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    console.error('Change password controller error:', error.message);
    const status = error.message.includes('incorrect') ? 401 : 400;
    return res.status(status).json({ success: false, message: error.message });
  }
};
