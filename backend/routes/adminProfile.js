const express = require('express');
const { protect } = require('../middleware/auth');
const {
  updateAdminProfile,
  getAdminProfile
} = require('../controllers/adminProfileController');

const router = express.Router();

// All routes are protected
router.use(protect);

// Get admin profile
router.get('/profile', getAdminProfile);

// Update admin email and password
router.put('/profile', updateAdminProfile);

module.exports = router;
