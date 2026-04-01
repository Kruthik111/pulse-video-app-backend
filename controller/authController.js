const { asyncHandler } = require('../middleware/errorHandler');
const authService = require('../services/authService');

/**
 * @desc    Register user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res, next) => {
  const user = await authService.register(req.body);

  const token = user.getSignedJwtToken();

  res.status(201).json({
    success: true,
    token,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId
    },
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email & password
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Please provide email and password',
      requestId: req.requestId,
      timestamp: new Date().toISOString()
    });
  }

  // Check for user
  const user = await authService.login(email, password);

  const token = user.getSignedJwtToken();

  res.status(200).json({
    success: true,
    token,
    data: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId
    },
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

/**
 * @desc    Get current user profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res, next) => {
  const user = await authService.findUserById(req.user.id);

  res.status(200).json({
    success: true,
    data: user,
    requestId: req.requestId,
    timestamp: new Date().toISOString()
  });
});

module.exports = {
  register,
  login,
  getMe
};
