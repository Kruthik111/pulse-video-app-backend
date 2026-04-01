const User = require('../models/User');

const register = async (userData) => {
  const { name, email, password, role, tenantId } = userData;

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role,
    tenantId
  });

  return user;
};

const login = async (email, password) => {
  // Check for user
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('Invalid credentials');
  }

  // Check if password matches
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new Error('Invalid credentials');
  }

  return user;
};

const findUserById = async (id) => {
  return await User.findById(id);
};

module.exports = {
  register,
  login,
  findUserById
};
