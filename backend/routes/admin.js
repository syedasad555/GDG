const express = require('express');
const adminController = require('../controllers/adminController');
const teamController = require('../controllers/teamController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/multer');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(protect, restrictTo('admin'));

// Dashboard
router.get('/dashboard', adminController.getDashboardStats);

// Users management
router.get('/users', adminController.getAllUsers);
router.post('/users/:userId/promote', adminController.promoteUserToAdmin);
router.post('/users/:userId/demote', adminController.demoteAdminToUser);

// Team (public-facing profiles: photo, name, LinkedIn, role, section)
router.get('/team', teamController.getAllTeamMembersAdmin);
router.post('/team', upload.single('photo'), teamController.addTeamMember);
router.put('/team/:id', upload.single('photo'), teamController.updateTeamMember);
router.delete('/team/:id', teamController.deleteTeamMember);

// Stats
router.get('/stats/events', adminController.getEventStats);
router.get('/stats/contests', adminController.getContestStats);

// Leaderboard management
router.post('/leaderboard/upload', upload.single('file'), adminController.uploadLeaderboard);
router.delete('/leaderboard/reset', adminController.resetLeaderboard);
router.delete('/leaderboard/:id', adminController.deleteLeaderboardEntry);
router.get('/leaderboard/snapshots', adminController.getLeaderboardSnapshots);
router.delete('/leaderboard/snapshots/reset', adminController.resetPastChampions);

module.exports = router;
