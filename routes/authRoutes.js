const express = require('express');
const {
  register,
  login,
  getMe
} = require('../controller/authController');

const { protect } = require('../middleware/auth');
const { validateBody } = require('../middleware/validation');
const { registerSchema, loginSchema } = require('../validation/authValidation');

const router = express.Router();

router.post('/register', validateBody(registerSchema), register);
router.post('/login', validateBody(loginSchema), login);
router.get('/me', protect, getMe);

module.exports = router;
