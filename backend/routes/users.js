const express = require('express');
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/multer');

const router = express.Router();

router.get('/', userController.getAllUsers);
router.get('/profile', protect, userController.getProfile);
router.put('/profile', protect, upload.single('profilePhoto'), userController.updateProfile);
router.get('/:id', userController.getUserById);
router.delete('/:id', protect, userController.deleteUser);

module.exports = router;
