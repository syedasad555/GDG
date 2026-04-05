const User = require('../models/User');
const path = require('path');
const fs = require('fs');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('registeredEvents')
      .populate('savedEvents')
      .populate('contestHistory.contestId');

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

exports.updateProfile = async (req, res) => {
  try {
    const { name, branch, year, hackerrankHandle } = req.body;
    const updateData = {
      name,
      branch,
      year,
      hackerrankHandle
    };

    // Handle file upload
    if (req.file) {
      // Delete old profile photo if exists
      if (req.user.profilePhoto) {
        const oldPath = path.join(__dirname, '../uploads', path.basename(req.user.profilePhoto));
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      updateData.profilePhoto = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateData,
      { new: true, runValidators: true }
    );

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

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.status(200).json({
      status: 'success',
      count: users.length,
      users
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('registeredEvents')
      .populate('savedEvents')
      .populate('contestHistory.contestId');

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

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

exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(204).json({
      status: 'success'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
