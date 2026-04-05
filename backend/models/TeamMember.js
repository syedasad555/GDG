const mongoose = require('mongoose');

const SECTIONS = [
  'leadership',
  'web',
  'cloud',
  'android',
  'aiml',
  'design',
  'marketing',
];

const teamMemberSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    photo: {
      type: String,
      default: '',
    },
    linkedInUrl: {
      type: String,
      default: '',
      trim: true,
    },
    role: {
      type: String,
      required: true,
      default: 'Member',
      trim: true,
    },
    section: {
      type: String,
      required: true,
      enum: SECTIONS,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

teamMemberSchema.index({ section: 1, sortOrder: 1, name: 1 });

const TeamMember = mongoose.model('TeamMember', teamMemberSchema);
TeamMember.SECTIONS = SECTIONS;
module.exports = TeamMember;
