import jwt from 'jsonwebtoken';
import User from '../models/User.model.js';

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
export const register = async (req, res) => {
  const { name, email, password, phone, pincode, address, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'Email already registered' });
  }

  // Prevent creating admin via public register
  const safeRole = role === 'agent' ? 'agent' : 'customer';

  const user = await User.create({
    name, email, password, phone, pincode, address,
    role: safeRole,
  });

  const token = signToken(user._id);

  res.status(201).json({
    success: true,
    message: 'Registration successful',
    token,
    user,
  });
};

// POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password required' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Account is deactivated' });
  }

  const token = signToken(user._id);

  // Remove password from response
  const userObj = user.toJSON();

  res.status(200).json({
    success: true,
    message: 'Login successful',
    token,
    user: userObj,
  });
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({ success: true, user });
};

// PATCH /api/auth/update-profile
export const updateProfile = async (req, res) => {
  const { name, phone, pincode, address } = req.body;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { name, phone, pincode, address },
    { new: true, runValidators: true }
  );

  res.status(200).json({ success: true, user });
};