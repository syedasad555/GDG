const Gallery = require('../models/Gallery');
const catchAsync = require('../utils/catchAsync');
const path = require('path');
const fs = require('fs');

const deleteUploadFile = (imagePath) => {
  if (!imagePath) return;
  const filePath = path.join(__dirname, '../uploads', path.basename(imagePath));
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Get all gallery items (admin)
exports.getAllGalleries = catchAsync(async (req, res, next) => {
  const { category } = req.query;
  let query = {};
  
  if (category) {
    query.category = category;
  }

  const galleries = await Gallery.find(query)
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    count: galleries.length,
    gallery: galleries
  });
});

// Get published gallery items (public)
exports.getPublishedGalleries = catchAsync(async (req, res, next) => {
  const { category } = req.query;
  let query = { isPublished: true };
  
  if (category) {
    query.category = category;
  }

  const galleries = await Gallery.find(query)
    .populate('uploadedBy', 'name email')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    count: galleries.length,
    gallery: galleries
  });
});

// Get single gallery item
exports.getGalleryById = catchAsync(async (req, res, next) => {
  const gallery = await Gallery.findById(req.params.id)
    .populate('uploadedBy', 'name email');

  if (!gallery) {
    return res.status(404).json({
      status: 'fail',
      message: 'Gallery item not found'
    });
  }

  res.status(200).json({
    status: 'success',
    gallery
  });
});

// Create gallery item
exports.createGallery = catchAsync(async (req, res, next) => {
  const { title, description, category, tags } = req.body;

  // Check if any images are provided
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({
      status: 'fail',
      message: 'At least one image is required'
    });
  }

  const galleryData = {
    title,
    description,
    category,
    uploadedBy: req.user.id,
    titleImage: `/uploads/${req.files[0].filename}`,
    tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
    images: [],
    isPublished: true
  };

  // Handle additional images (skip first file which is title image)
  if (req.files.length > 1) {
    galleryData.images = req.files.slice(1).map((file, index) => ({
      url: `/uploads/${file.filename}`,
      caption: `Image ${index + 1}`,
      uploadedAt: new Date()
    }));
  }

  const gallery = await Gallery.create(galleryData);

  res.status(201).json({
    status: 'success',
    gallery
  });
});

// Update gallery item
exports.updateGallery = catchAsync(async (req, res, next) => {
  const { title, description, category, tags, isPublished } = req.body;

  const gallery = await Gallery.findById(req.params.id);
  if (!gallery) {
    return res.status(404).json({
      status: 'fail',
      message: 'Gallery item not found'
    });
  }

  const updateData = {
    title,
    description,
    category,
    tags: tags ? tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
    isPublished: isPublished !== undefined ? isPublished : gallery.isPublished
  };

  // Handle title image update (first file if provided)
  if (req.files && req.files.length > 0) {
    deleteUploadFile(gallery.titleImage);
    updateData.titleImage = `/uploads/${req.files[0].filename}`;
  }

  // Handle additional images (skip first file if title image updated)
  if (req.files && req.files.length > 1) {
    const additionalImages = req.files.slice(1).map((file, index) => ({
      url: `/uploads/${file.filename}`,
      caption: `Image ${index + 1}`,
      uploadedAt: new Date()
    }));
    
    // Merge with existing images
    updateData.images = [...(gallery.images || []), ...additionalImages];
  }

  const updatedGallery = await Gallery.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.status(200).json({
    status: 'success',
    gallery: updatedGallery
  });
});

// Delete gallery item
exports.deleteGallery = catchAsync(async (req, res, next) => {
  const gallery = await Gallery.findByIdAndDelete(req.params.id);

  if (!gallery) {
    return res.status(404).json({
      status: 'fail',
      message: 'Gallery item not found'
    });
  }

  deleteUploadFile(gallery.titleImage);
  if (gallery.images && gallery.images.length > 0) {
    gallery.images.forEach((image) => deleteUploadFile(image.url));
  }

  res.status(200).json({
    status: 'success',
    message: 'Gallery item deleted successfully'
  });
});
