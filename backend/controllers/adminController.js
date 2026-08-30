const User = require('../models/User');
const Event = require('../models/Event');
const Blog = require('../models/Blog');
const Contest = require('../models/Contest');
const TeamMember = require('../models/TeamMember');
const Gallery = require('../models/Gallery');
const Leaderboard = require('../models/Leaderboard');
const LeaderboardSnapshot = require('../models/LeaderboardSnapshot');
const csv = require('csv-parser');
const fs = require('fs');

exports.getDashboardStats = async (req, res) => {
  try {
    const totalTeamMembers = await TeamMember.countDocuments();
    const totalEvents = await Event.countDocuments();
    const totalBlogs = await Blog.countDocuments();
    const totalContests = await Contest.countDocuments();

    const galleryItems = await Gallery.find().select('images');
    const totalGalleryPictures = galleryItems.reduce(
      (sum, g) => sum + 1 + (g.images?.length || 0),
      0
    );

    const upcomingEvents = await Event.countDocuments({
      date: { $gte: new Date() }
    });

    const topPerformers = await User.find()
      .sort({ score: -1 })
      .limit(5)
      .select('name email score badges');

    res.status(200).json({
      status: 'success',
      stats: {
        totalTeamMembers,
        totalGalleryPictures,
        totalEvents,
        totalBlogs,
        totalContests,
        upcomingEvents
      },
      topPerformers
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');

    res.status(200).json({
      status: 'success',
      count: users.length,
      users
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.promoteUserToAdmin = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'User promoted to admin',
      user
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.demoteAdminToUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { role: 'user' },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Admin demoted to user',
      user
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getEventStats = async (req, res) => {
  try {
    const totalEvents = await Event.countDocuments();
    const publishedEvents = await Event.countDocuments({ isPublished: true });
    const upcomingEvents = await Event.countDocuments({
      isPublished: true,
      date: { $gte: new Date() }
    });
    const pastEvents = await Event.countDocuments({
      isPublished: true,
      date: { $lt: new Date() }
    });

    const eventsByCategory = await Event.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      status: 'success',
      stats: {
        totalEvents,
        publishedEvents,
        upcomingEvents,
        pastEvents,
        byCategory: eventsByCategory
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getContestStats = async (req, res) => {
  try {
    const totalContests = await Contest.countDocuments();
    const activeContests = await Contest.countDocuments({ isActive: true });

    const contestsByPlatform = await Contest.aggregate([
      { $group: { _id: '$platform', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      status: 'success',
      stats: {
        totalContests,
        activeContests,
        byPlatform: contestsByPlatform
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.uploadLeaderboard = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'fail',
        message: 'No file uploaded'
      });
    }

    const results = [];
    const filePath = req.file.path;

    // Helper to get field value case-insensitively from CSV row
    const getFieldValue = (row, keyAliases, fallback = '') => {
      const keys = Object.keys(row);
      for (const k of keys) {
        const cleanK = k.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
        for (const alias of keyAliases) {
          if (cleanK === alias.toLowerCase().replace(/[^a-z0-9]/g, '')) {
            const val = row[k];
            return val !== undefined && val !== null ? String(val).trim() : fallback;
          }
        }
      }
      return fallback;
    };

    // Parse CSV file
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        results.push(data);
      })
      .on('end', async () => {
        try {
          let count = 0;

          // Process each row
          for (const row of results) {
            const name = getFieldValue(row, ['name', 'username', 'studentname', 'player', 'user']);
            const hackerRankId = getFieldValue(row, ['hackerrankid', 'hackerrank', 'handle', 'id']);
            const scoreRaw = getFieldValue(row, ['score', 'points', 'marks']);
            const contestName = getFieldValue(row, ['contestname', 'contest', 'eventname', 'competition'], 'Contest');
            const email = getFieldValue(row, ['email'], `${hackerRankId ? hackerRankId.toLowerCase() : 'user'}@gdg.club`);
            const rollNumber = getFieldValue(row, ['rollnumber', 'rollno'], 'N/A');
            
            // Validation: name, score, and hackerRankId are required
            if (!name || !scoreRaw || !hackerRankId) {
              console.log('Skipping invalid row - missing required fields (name, hackerRankId, or score):', row);
              continue;
            }

            const scoreValue = parseInt(scoreRaw) || 0;
            if (scoreValue <= 0) {
              console.log('Skipping row with invalid score:', row);
              continue;
            }

            // Skip if HackerRank ID is 'N/A' or empty
            if (hackerRankId === 'N/A' || !hackerRankId || hackerRankId.trim() === '') {
              console.log('Skipping row without valid HackerRank ID:', row);
              continue;
            }

            console.log('Processing entry:', { name, contestName, hackerRankId, score: scoreValue });

            // Update or create entries for all three periods
            const periods = ['weekly', 'monthly', 'all-time'];
            
            for (const period of periods) {
              // Find existing entry by HackerRank ID (primary key)
              let existingEntry = await Leaderboard.findOne({
                hackerRankId: hackerRankId,
                period: period
              });

              if (existingEntry) {
                // Update existing entry - add to existing score
                const oldScore = existingEntry.score || 0;
                existingEntry.score = oldScore + scoreValue;
                existingEntry.name = name; // Update name in case it changed
                existingEntry.rollNumber = rollNumber;
                existingEntry.hackerRankId = hackerRankId;
                existingEntry.contestName = contestName;
                existingEntry.contestsParticipated = (existingEntry.contestsParticipated || 0) + 1;
                existingEntry.averageScore = existingEntry.score / existingEntry.contestsParticipated;
                
                await existingEntry.save();
                console.log(`Updated existing ${period} entry: ${hackerRankId} - ${oldScore} + ${scoreValue} = ${existingEntry.score}`);
              } else {
                // Create new entry
                const leaderboardData = {
                  name: name,
                  email: email,
                  rollNumber: rollNumber,
                  hackerRankId: hackerRankId,
                  score: scoreValue,
                  contestName: contestName,
                  contestsParticipated: 1,
                  averageScore: scoreValue,
                  period: period,
                  weekStart: period === 'weekly' ? new Date() : undefined,
                  monthStart: period === 'monthly' ? new Date() : undefined
                };

                await Leaderboard.create(leaderboardData);
                console.log(`Created new ${period} entry: ${hackerRankId} - ${scoreValue}`);
              }
            }

            count++;
          }

          // Re-rank all entries for each period after processing all rows
          console.log('Re-ranking entries...');
          const periods = ['weekly', 'monthly', 'all-time'];
          
          for (const period of periods) {
            // Get all entries for the period, sorted by score (descending)
            const entries = await Leaderboard.find({ period: period })
              .sort({ score: -1, createdAt: 1 });
            
            // Update ranks
            for (let i = 0; i < entries.length; i++) {
              entries[i].rank = i + 1;
              await entries[i].save();
            }
            
            console.log(`Re-ranked ${entries.length} entries for ${period} period`);
          }

          // Delete uploaded file
          fs.unlinkSync(filePath);

          res.status(201).json({
            status: 'success',
            message: 'Leaderboard updated successfully',
            count
          });
        } catch (err) {
          console.error('Error processing CSV:', err);
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
          res.status(400).json({
            status: 'fail',
            message: 'Error processing CSV file: ' + err.message
          });
        }
      })
      .on('error', (err) => {
        console.error('CSV parsing error:', err);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        res.status(400).json({
          status: 'fail',
          message: 'Error reading CSV file: ' + err.message
        });
      });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.deleteLeaderboardEntry = async (req, res) => {
  try {
    const { id } = req.params;

    const entry = await Leaderboard.findByIdAndDelete(id);

    if (!entry) {
      return res.status(404).json({
        status: 'fail',
        message: 'Leaderboard entry not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Leaderboard entry deleted successfully'
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.resetLeaderboard = async (req, res) => {
  try {
    // Get top 3 performers before deletion
    const topPerformers = await Leaderboard.find({ period: 'all-time' })
      .sort({ score: -1 })
      .limit(3);

    // Create snapshot if we have data
    let existingSnapshot = null;
    if (topPerformers.length > 0) {
      const monthLabel = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long' 
      });

      const snapshotData = topPerformers.map((performer, index) => ({
        rank: index + 1,
        name: performer.name || 'Unknown',
        hackerRankId: performer.hackerRankId || 'N/A',
        score: performer.score
      }));

      // Check if snapshot for this month already exists
      existingSnapshot = await LeaderboardSnapshot.findOne({ month: monthLabel });
      
      if (existingSnapshot) {
        // Update existing snapshot
        existingSnapshot.topPerformers = snapshotData;
        await existingSnapshot.save();
        console.log('Updated existing snapshot for month:', monthLabel);
      } else {
        // Create new snapshot
        await LeaderboardSnapshot.create({
          month: monthLabel,
          topPerformers: snapshotData
        });
        console.log('Created new snapshot for month:', monthLabel);
      }
    } else {
      console.log('No top performers found, no snapshot created');
    }

    // Delete all leaderboard entries
    const result = await Leaderboard.deleteMany({});

    res.status(200).json({
      status: 'success',
      message: 'All leaderboard data has been successfully deleted',
      deletedCount: result.deletedCount,
      snapshotCreated: topPerformers.length > 0 && !existingSnapshot,
      snapshotUpdated: existingSnapshot !== null
    });
  } catch (err) {
    console.error('Error in resetLeaderboard:', err);
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.getLeaderboardSnapshots = async (req, res) => {
  try {
    const snapshots = await LeaderboardSnapshot.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      count: snapshots.length,
      snapshots
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};

exports.resetPastChampions = async (req, res) => {
  try {
    // Delete all leaderboard snapshots
    const result = await LeaderboardSnapshot.deleteMany({});

    res.status(200).json({
      status: 'success',
      message: 'All past champions data has been successfully deleted',
      deletedCount: result.deletedCount
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message
    });
  }
};
