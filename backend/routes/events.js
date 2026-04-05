const express = require('express');
const eventController = require('../controllers/eventController');
const { protect, restrictTo } = require('../middleware/auth');
const upload = require('../middleware/multer');

const router = express.Router();

// Public routes
router.get('/', eventController.getAllEvents);
router.get('/upcoming', eventController.getUpcomingEvents);
router.get('/past', eventController.getPastEvents);
router.get('/:id', eventController.getEventById);

// Public: register without an account (duplicate blocked by email per event)
router.post('/:id/register', eventController.registerEvent);

// Protected routes
router.post('/', protect, restrictTo('admin'), upload.single('coverImage'), eventController.createEvent);
router.put('/:id', protect, restrictTo('admin'), upload.single('coverImage'), eventController.updateEvent);
router.delete('/:id', protect, restrictTo('admin'), eventController.deleteEvent);
router.get('/:id/registrations', protect, restrictTo('admin'), eventController.getEventRegistrations);

// Save/unsave events
router.post('/:id/save', protect, eventController.saveEvent);
router.delete('/:id/save', protect, eventController.unsaveEvent);

module.exports = router;
