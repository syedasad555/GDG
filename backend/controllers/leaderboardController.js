const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');

exports.getWeeklyLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find({ period: 'weekly' })
      .populate('user', 'name email rollNumber profilePhoto hackerrankHandle')
      .sort({ score: -1 })
      .limit(100);

    // Add rank
    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry.toObject(),
      rank: index + 1
    }));

    res.status(200).json({
      status: 'success',
      count: rankedLeaderboard.length,
      leaderboard: rankedLeaderboard
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getMonthlyLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find({ period: 'monthly' })
      .populate('user', 'name email rollNumber profilePhoto hackerrankHandle')
      .sort({ score: -1 })
      .limit(100);

    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry.toObject(),
      rank: index + 1
    }));

    res.status(200).json({
      status: 'success',
      count: rankedLeaderboard.length,
      leaderboard: rankedLeaderboard
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getAllTimeLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Leaderboard.find({ period: 'all-time' })
      .populate('user', 'name email rollNumber profilePhoto hackerrankHandle badges')
      .sort({ score: -1 })
      .limit(100);

    const rankedLeaderboard = leaderboard.map((entry, index) => ({
      ...entry.toObject(),
      rank: index + 1
    }));

    res.status(200).json({
      status: 'success',
      count: rankedLeaderboard.length,
      leaderboard: rankedLeaderboard
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getUserRank = async (req, res) => {
  try {
    const { userId, period } = req.params;

    const userEntry = await Leaderboard.findOne({
      user: userId,
      period: period || 'all-time'
    }).populate('user', 'name email rollNumber profilePhoto hackerrankHandle');

    if (!userEntry) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found in leaderboard'
      });
    }

    // Get rank
    const rank = await Leaderboard.countDocuments({
      period: period || 'all-time',
      score: { $gt: userEntry.score }
    }) + 1;

    res.status(200).json({
      status: 'success',
      rank,
      entry: userEntry
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.updateLeaderboard = async (req, res) => {
  try {
    // This would be called periodically to update leaderboard
    // Get all users and calculate their scores
    const users = await User.find();

    for (const user of users) {
      // Calculate all-time score
      const allTimeEntry = await Leaderboard.findOne({
        user: user._id,
        period: 'all-time'
      });

      if (allTimeEntry) {
        allTimeEntry.score = user.score;
        allTimeEntry.contestsParticipated = user.contestHistory.length;
        if (user.contestHistory.length > 0) {
          allTimeEntry.averageScore = user.score / user.contestHistory.length;
        }
        await allTimeEntry.save();
      } else {
        await Leaderboard.create({
          user: user._id,
          score: user.score,
          period: 'all-time',
          contestsParticipated: user.contestHistory.length,
          averageScore: user.contestHistory.length > 0 ? user.score / user.contestHistory.length : 0
        });
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Leaderboard updated'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
