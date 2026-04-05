const mongoose = require('mongoose');

const leaderboardSnapshotSchema = new mongoose.Schema({
  month: {
    type: String,
    required: [true, 'Month label is required'],
    trim: true
  },
  topPerformers: [{
    rank: {
      type: Number,
      required: true,
      min: 1,
      max: 3
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true
    },
    hackerRankId: {
      type: String,
      required: [true, 'HackerRank ID is required'],
      trim: true
    },
    score: {
      type: Number,
      required: [true, 'Score is required'],
      min: 0
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
leaderboardSnapshotSchema.index({ createdAt: -1 });

module.exports = mongoose.model('LeaderboardSnapshot', leaderboardSnapshotSchema);
