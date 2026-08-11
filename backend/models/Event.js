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

  // Hackathon-specific fields (only required when category is Hackathon)
  teamSize: {
    type: Number,
    default: null,
    validate: {
      validator: function (v) {
        // For non-hackathon events, allow null/undefined.
        if (this.category !== 'Hackathon') return true;
        // For hackathon, require a positive number.
        return typeof v === 'number' && v > 0;
      },
      message: 'teamSize must be a positive number for Hackathon events'
    }
  },
  teamMembers: {
    type: Number,
    default: null,
    validate: {
      validator: function (v) {
        if (this.category !== 'Hackathon') return true;
        return typeof v === 'number' && v > 0;
      },
      message: 'teamMembers must be a positive number for Hackathon events'
    }
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
    // Hackathon team registration fields
    teamName: String,
    members: [{
      name: String,
      rollNumber: String,
      phone: String,
      email: String
    }],
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
