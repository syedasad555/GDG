const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  context: {
    type: String,
    default: ''
  },
  date: {
    type: Date,
    required: true
  },
  time: String,
  endDate: Date,
  endTime: String,
  registrationEndTime: Date,
  venue: String,
  address: String,
  locationLink: String,
  coverImage: String,
  category: {
    type: String,
    enum: ['Workshop', 'Hackathon', 'Talk', 'Conference', 'Webinar', 'Meetup'],
    required: true
  },
  tags: [String],
  speaker: {
    name: String,
    role: String,
    company: String,
    bio: String,
    avatar: String,
    twitter: String,
    linkedin: String,
    website: String
  },
  speakers: [{
    name: String,
    role: String,
    company: String,
    bio: String,
    avatar: String,
    twitter: String,
    linkedin: String,
    website: String
  }],
  schedule: [{
    time: String,
    title: String,
    description: String,
    speaker: {
      name: String,
      role: String,
      avatar: String
    }
  }],
  capacity: Number,
  registeredCount: {
    type: Number,
    default: 0
  },
  registrations: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    email: String,
    phone: String,
    rollNumber: String,
    branch: String,
    year: String,
    registeredAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPublished: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  relatedEvents: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  }]
}, {
  timestamps: true
});

// Add text index for search
eventSchema.index({
  title: 'text',
  description: 'text',
  'speaker.name': 'text',
  tags: 'text'
});

module.exports = mongoose.model('Event', eventSchema);
