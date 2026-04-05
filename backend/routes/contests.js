const express = require('express');
const contestController = require('../controllers/contestController');
const { protect, restrictTo } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', contestController.getAllContests);
router.get('/:id', contestController.getContestById);
router.get('/:id/scores', contestController.getContestScores);

// Protected routes
router.post('/', protect, restrictTo('admin'), contestController.createContest);
router.put('/:id', protect, restrictTo('admin'), contestController.updateContest);
router.delete('/:id', protect, restrictTo('admin'), contestController.deleteContest);

// Upload scores
router.post('/:id/scores', protect, restrictTo('admin'), contestController.uploadScores);

module.exports = router;
