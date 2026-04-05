const Contest = require('../models/Contest');
const Leaderboard = require('../models/Leaderboard');
const User = require('../models/User');

exports.getAllContests = async (req, res) => {
  try {
    const contests = await Contest.find()
      .populate('createdBy', 'name email')
      .sort({ startDate: -1 });

    res.status(200).json({
      status: 'success',
      count: contests.length,
      contests
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getContestById = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('scores.user', 'name email rollNumber');

    if (!contest) {
      return res.status(404).json({
        status: 'fail',
        message: 'Contest not found'
      });
    }

    res.status(200).json({
      status: 'success',
      contest
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.createContest = async (req, res) => {
  try {
    const { title, description, platform, startDate, endDate, link } = req.body;

    const contest = await Contest.create({
      title,
      description,
      platform,
      startDate,
      endDate,
      link,
      createdBy: req.user.id
    });

    res.status(201).json({
      status: 'success',
      contest
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.updateContest = async (req, res) => {
  try {
    const { title, description, platform, startDate, endDate, link, isActive } = req.body;

    const contest = await Contest.findByIdAndUpdate(
      req.params.id,
      { title, description, platform, startDate, endDate, link, isActive },
      { new: true, runValidators: true }
    );

    if (!contest) {
      return res.status(404).json({
        status: 'fail',
        message: 'Contest not found'
      });
    }

    res.status(200).json({
      status: 'success',
      contest
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.deleteContest = async (req, res) => {
  try {
    const contest = await Contest.findByIdAndDelete(req.params.id);

    if (!contest) {
      return res.status(404).json({
        status: 'fail',
        message: 'Contest not found'
      });
    }

    // Delete associated leaderboard entries
    await Leaderboard.deleteMany({ contestId: req.params.id });

    res.status(204).json({
      status: 'success'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.uploadScores = async (req, res) => {
  try {
    const { scores } = req.body; // Array of {username, score, rank}
    const contest = await Contest.findById(req.params.id);

    if (!contest) {
      return res.status(404).json({
        status: 'fail',
        message: 'Contest not found'
      });
    }

    // Process scores
    for (const scoreData of scores) {
      const user = await User.findOne({ hackerrankHandle: scoreData.username });

      if (user) {
        // Update user score
        user.score = (user.score || 0) + scoreData.score;
        user.contestHistory.push({
          contestId: contest._id,
          score: scoreData.score,
          rank: scoreData.rank,
          date: new Date()
        });
        await user.save();

        // Update leaderboard
        const leaderboardEntry = await Leaderboard.findOne({
          user: user._id,
          period: 'all-time'
        });

        if (leaderboardEntry) {
          leaderboardEntry.score = user.score;
          leaderboardEntry.contestsParticipated = user.contestHistory.length;
          leaderboardEntry.averageScore = user.score / user.contestHistory.length;
          await leaderboardEntry.save();
        } else {
          await Leaderboard.create({
            user: user._id,
            score: user.score,
            period: 'all-time',
            contestsParticipated: user.contestHistory.length,
            averageScore: user.score / user.contestHistory.length
          });
        }
      }

      // Add to contest scores
      contest.scores.push({
        username: scoreData.username,
        score: scoreData.score,
        rank: scoreData.rank
      });
    }

    await contest.save();

    res.status(200).json({
      status: 'success',
      message: 'Scores uploaded successfully'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getContestScores = async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
      .populate('scores.user', 'name email rollNumber hackerrankHandle');

    if (!contest) {
      return res.status(404).json({
        status: 'fail',
        message: 'Contest not found'
      });
    }

    res.status(200).json({
      status: 'success',
      scores: contest.scores
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
