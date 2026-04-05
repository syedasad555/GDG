const mongoose = require('mongoose');

const gdgMemberSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  rollNumber: {
    type: String,
    required: true,
    unique: true
  },
  branch: String,
  year: Number,
  role: {
    type: String,
    enum: ['Core Team', 'Member', 'Volunteer'],
    default: 'Member'
  },
  joinDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GDGMember', gdgMemberSchema);
