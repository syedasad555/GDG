const express = require('express');
const leaderboardController = require('../controllers/leaderboardController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/weekly', leaderboardController.getWeeklyLeaderboard);
router.get('/monthly', leaderboardController.getMonthlyLeaderboard);
router.get('/all-time', leaderboardController.getAllTimeLeaderboard);
router.get('/user/:userId/:period', protect, leaderboardController.getUserRank);
router.post('/update', protect, leaderboardController.updateLeaderboard);

module.exports = router;
