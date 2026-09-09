const Blog = require('../models/Blog');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const path = require('path');
const fs = require('fs');

// Helper function to generate excerpt
const generateExcerpt = (content, length = 150) => {
  if (!content) return '';
  return content.substring(0, length).replace(/\s+\S*$/, '') + '...';
};

const deleteUploadFile = (imagePath) => {
  if (!imagePath) return;
  const filePath = path.join(__dirname, '../uploads', path.basename(imagePath));
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
};

// Get all blogs (public)
exports.getAllBlogs = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, category, search } = req.query;
  
  let query = { isPublished: true };
  
  if (category) {
    query.category = category;
  }
  
  if (search) {
    query.$text = { $search: search };
  }
  
  const blogs = await Blog.find(query)
    .populate('author', 'name email')
    .sort({ publishedAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const total = await Blog.countDocuments(query);
  
  res.status(200).json({
    status: 'success',
    results: blogs.length,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: {
      blogs: blogs || []
    }
  });
});

// Get blog by slug (public)
exports.getBlogBySlug = catchAsync(async (req, res, next) => {
  const blog = await Blog.findOne({ 
    slug: req.params.slug, 
    isPublished: true 
  }).populate('author', 'name email');
  
  if (!blog) {
    return next(new AppError('Blog not found', 404));
  }
  
  // Increment views
  blog.views += 1;
  await blog.save({ validateBeforeSave: false });
  
  res.status(200).json({
    status: 'success',
    data: {
      blog
    }
  });
});

// Create blog (admin only)
exports.createBlog = catchAsync(async (req, res, next) => {
  const blogData = {
    ...req.body,
    author: req.user.id,
    coverImage: req.file ? `/uploads/${req.file.filename}` : undefined,
    excerpt: req.body.excerpt || generateExcerpt(req.body.content),
    isPublished: true, // Auto-publish admin-created blogs
    publishedAt: new Date() // Set published date for admin blogs
  };
  
  const blog = await Blog.create(blogData);
  
  res.status(201).json({
    status: 'success',
    data: {
      blog
    }
  });
});

// Update blog (admin only)
exports.updateBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  
  if (!blog) {
    return next(new AppError('Blog not found', 404));
  }
  
  const updateData = {
    ...req.body,
    excerpt: req.body.excerpt || generateExcerpt(req.body.content)
  };
  
  // Handle cover image update
  if (req.file) {
    deleteUploadFile(blog.coverImage);
    updateData.coverImage = `/uploads/${req.file.filename}`;
  }
  
  // Handle publish status change
  if (req.body.isPublished === 'true' || req.body.isPublished === true) {
    if (!blog.isPublished) {
      updateData.publishedAt = new Date();
    }
  }
  
  const updatedBlog = await Blog.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('author', 'name email');
  
  res.status(200).json({
    status: 'success',
    data: {
      blog: updatedBlog
    }
  });
});

// Delete blog (admin only)
exports.deleteBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findByIdAndDelete(req.params.id);
  
  if (!blog) {
    return next(new AppError('Blog not found', 404));
  }

  deleteUploadFile(blog.coverImage);
  
  res.status(204).json({
    status: 'success',
    data: null
  });
});

// Like blog
exports.likeBlog = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id);
  
  if (!blog) {
    return next(new AppError('Blog not found', 404));
  }
  
  const userId = req.user.id;
  const hasLiked = blog.likedBy.includes(userId);
  
  if (hasLiked) {
    // Unlike
    blog.likedBy = blog.likedBy.filter(id => id.toString() !== userId);
    blog.likes -= 1;
  } else {
    // Like
    blog.likedBy.push(userId);
    blog.likes += 1;
  }
  
  await blog.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      liked: !hasLiked,
      likes: blog.likes
    }
  });
});

// Add comment
exports.addComment = catchAsync(async (req, res, next) => {
  const { text } = req.body;
  
  if (!text) {
    return next(new AppError('Comment text is required', 400));
  }
  
  const blog = await Blog.findById(req.params.id);
  
  if (!blog) {
    return next(new AppError('Blog not found', 404));
  }
  
  blog.comments.push({
    user: req.user.id,
    text
  });
  
  await blog.save();
  
  // Return the newly added comment with user info
  const newComment = blog.comments[blog.comments.length - 1];
  await newComment.populate('user', 'name email');
  
  res.status(201).json({
    status: 'success',
    data: {
      comment: newComment
    }
  });
});

// Get all blogs (admin)
exports.getAllBlogsAdmin = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;
  
  let query = {};
  
  if (status === 'published') {
    query.isPublished = true;
  } else if (status === 'draft') {
    query.isPublished = false;
  }
  
  const blogs = await Blog.find(query)
    .populate('author', 'name email')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const total = await Blog.countDocuments(query);
  
  res.status(200).json({
    status: 'success',
    results: blogs.length,
    totalPages: Math.ceil(total / limit),
    currentPage: page,
    data: {
      blogs: blogs || []
    }
  });
});

// Get blog by ID (admin)
exports.getBlogById = catchAsync(async (req, res, next) => {
  const blog = await Blog.findById(req.params.id).populate('author', 'name email');
  
  if (!blog) {
    return next(new AppError('Blog not found', 404));
  }
  
  res.status(200).json({
    status: 'success',
    data: {
      blog
    }
  });
});
