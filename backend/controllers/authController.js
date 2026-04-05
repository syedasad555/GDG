const User = require('../models/User');
const GDGMember = require('../models/GDGMember');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production'
  };

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

exports.signup = async (req, res, next) => {
  try {
    const { name, email, password, rollNumber, branch, year, hackerrankHandle } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already registered'
      });
    }

    // Check if user is in GDG member list - validate email, rollNumber, branch, and year
    const gdgMember = await GDGMember.findOne({
      email: email.toLowerCase(),
      rollNumber: rollNumber,
      branch: branch,
      year: year
    });

    if (!gdgMember) {
      return res.status(400).json({
        status: 'fail',
        message: 'Your email, roll number, branch, and year do not match any GDG member records. Please contact the admin.'
      });
    }

    // Manually hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user with hashed password
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword, // Use hashed password
      rollNumber,
      branch,
      year,
      hackerrankHandle,
      isGDGMember: true
    });

    createSendToken(newUser, 201, res);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

// Admin creation function (bypasses GDG member requirement)
exports.createAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already registered'
      });
    }

    // Manually hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin user with hashed password
    const newAdmin = await User.create({
      name,
      email,
      password: hashedPassword, // Use hashed password
      role: 'admin',
      isGDGMember: true
    });

    // Also add to GDG members collection
    await GDGMember.create({
      name,
      email: email.toLowerCase(),
      rollNumber: 'ADMIN001',
      branch: 'Administration',
      year: 4,
      role: 'Core Team'
    });

    createSendToken(newAdmin, 201, res);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password!'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password'
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only administrators can sign in.'
      });
    }

    createSendToken(user, 200, res);
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });
  res.status(200).json({ status: 'success' });
};

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      status: 'success',
      user
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
