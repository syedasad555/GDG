const express = require('express');
const galleryController = require('../controllers/galleryController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/multer');

const router = express.Router();

// Public routes
router.get('/', galleryController.getPublishedGalleries);
router.get('/all', protect, restrictTo('admin'), galleryController.getAllGalleries);
router.get('/:id', galleryController.getGalleryById);

// Protected routes
router.post('/', protect, restrictTo('admin'), 
  upload.array('images', 10), 
  galleryController.createGallery
);
router.put('/:id', protect, restrictTo('admin'), 
  upload.array('images', 10), 
  galleryController.updateGallery
);
router.delete('/:id', protect, restrictTo('admin'), galleryController.deleteGallery);

module.exports = router;
