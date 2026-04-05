const mongoose = require('mongoose');

const leaderboardSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  rollNumber: {
    type: String,
    default: 'N/A'
  },
  hackerRankId: {
    type: String,
    default: 'N/A'
  },
  score: {
    type: Number,
    default: 0,
    required: true
  },
  contestName: {
    type: String,
    default: 'Contest'
  },
  rank: Number,
  period: {
    type: String,
    enum: ['weekly', 'monthly', 'all-time'],
    required: true
  },
  weekStart: Date,
  monthStart: Date,
  contestsParticipated: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Compound index for efficient querying
leaderboardSchema.index({ period: 1, score: -1, rank: 1 });

module.exports = mongoose.model('Leaderboard', leaderboardSchema);
