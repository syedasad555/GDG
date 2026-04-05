const express = require('express');
const blogController = require('../controllers/blogController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/multer');

const router = express.Router();

// Public routes
router.get('/', blogController.getAllBlogs);
router.get('/:slug', blogController.getBlogBySlug);

// Protected routes
router.post('/', protect, restrictTo('admin'), upload.single('coverImage'), blogController.createBlog);
router.put('/:id', protect, restrictTo('admin'), upload.single('coverImage'), blogController.updateBlog);
router.delete('/:id', protect, restrictTo('admin'), blogController.deleteBlog);

// Admin routes
router.get('/admin/all', protect, restrictTo('admin'), blogController.getAllBlogsAdmin);
router.get('/admin/:id', protect, restrictTo('admin'), blogController.getBlogById);

// Like and comment
router.post('/:id/like', protect, blogController.likeBlog);
router.post('/:id/comment', protect, blogController.addComment);

module.exports = router;
