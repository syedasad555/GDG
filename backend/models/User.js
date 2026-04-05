const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 6,
    select: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  // Student-specific fields (only for regular users)
  rollNumber: {
    type: String,
    required: function() { return this.role === 'user'; },
    unique: true,
    sparse: true // Allows multiple null values for admin users
  },
  branch: {
    type: String,
    required: function() { return this.role === 'user'; }
  },
  year: {
    type: Number,
    required: function() { return this.role === 'user'; }
  },
  hackerrankHandle: {
    type: String,
    required: function() { return this.role === 'user'; }
  },
  profilePhoto: String,
  isGDGMember: {
    type: Boolean,
    default: false
  },
  // Student-specific fields (only for regular users)
  score: {
    type: Number,
    default: 0,
    required: function() { return this.role === 'user'; }
  },
  badges: [{
    type: String,
    enum: ['winner', 'consistent_performer', 'top_10']
  }],
  contestHistory: [{
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Contest'
    },
    score: Number,
    rank: Number,
    date: Date
  }],
  savedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }],
  registeredEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
