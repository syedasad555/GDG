const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Update admin email and password
exports.updateAdminProfile = async (req, res) => {
  try {
    const { email, currentPassword, newPassword, confirmNewPassword } = req.body;
    const userId = req.user.id;

    console.log('📝 Admin Profile Update Request:');
    console.log('  User ID:', userId);
    console.log('  Email in request:', email);
    console.log('  Has currentPassword:', !!currentPassword);
    console.log('  Has newPassword:', !!newPassword);
    console.log('  Has confirmNewPassword:', !!confirmNewPassword);

    // Get current user
    const user = await User.findById(userId).select('+password');
    console.log('  User found:', !!user);
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Only admin users can update admin profile'
      });
    }

    let emailUpdated = false;
    let passwordUpdated = false;

    // Update email if provided
    if (email && email !== user.email) {
      console.log('  Validating email change...');
      console.log('  Current email:', user.email);
      console.log('  New email:', email);
      
      // Check if email already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        console.log('  ❌ Email already exists');
        return res.status(400).json({
          status: 'fail',
          message: 'Email already exists'
        });
      }
      
      console.log('  ✓ Email validation passed');
      user.email = email;
      emailUpdated = true;
    }

    // Update password if provided
    if (newPassword) {
      console.log('  Validating password change...');
      
      // Verify current password
      if (!currentPassword) {
        console.log('  ❌ No current password provided');
        return res.status(400).json({
          status: 'fail',
          message: 'Current password is required'
        });
      }

      const passwordMatches = await user.comparePassword(currentPassword);
      console.log('  Current password matches:', passwordMatches);
      
      if (!passwordMatches) {
        console.log('  ❌ Current password is incorrect');
        return res.status(400).json({
          status: 'fail',
          message: 'Current password is incorrect'
        });
      }

      // Check if new passwords match
      if (newPassword !== confirmNewPassword) {
        console.log('  ❌ New passwords do not match');
        return res.status(400).json({
          status: 'fail',
          message: 'New passwords do not match'
        });
      }

      console.log('  ✓ Password validation passed');
      // Set the plain password - the pre-save hook will hash it
      user.password = newPassword;
      passwordUpdated = true;
    }

    // Only save if there are changes
    if (emailUpdated || passwordUpdated) {
      console.log('  Saving changes...');
      console.log('  Email updated:', emailUpdated);
      console.log('  Password updated:', passwordUpdated);
      
      // Use save() to trigger the pre-save hook for password hashing
      // Bypass validation since admin users don't need student fields
      await user.save({ validateBeforeSave: false });
      console.log('  ✓ Changes saved to database');
    } else {
      console.log('  No changes detected');
    }

    // Get updated user without password
    const updatedUser = await User.findById(userId);
    console.log('  ✓ Fetched updated user from database');

    const message = emailUpdated && passwordUpdated 
      ? 'Email and password updated successfully'
      : emailUpdated 
      ? 'Email updated successfully'
      : passwordUpdated 
      ? 'Password updated successfully'
      : 'No changes made';

    console.log('  Response:', message);

    res.status(200).json({
      status: 'success',
      message: message,
      user: updatedUser
    });
  } catch (err) {
    console.error('Admin profile update error:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message || 'Error updating profile'
    });
  }
};

// Get admin profile
exports.getAdminProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({
        status: 'fail',
        message: 'Access denied'
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
