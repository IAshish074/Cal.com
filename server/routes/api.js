const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const eventTypeController = require('../controllers/eventTypeController');
const availabilityController = require('../controllers/availabilityController');
const bookingController = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

 
router.post('/auth/login', authController.login);
router.post('/auth/logout', authController.logout);
router.post('/auth/register', authController.register);
router.get('/auth/me', protect, authController.me);


router.get('/event-types', protect, eventTypeController.getEventTypes);
router.post('/event-types', protect, eventTypeController.createEventType);
router.put('/event-types/:id', protect, eventTypeController.updateEventType);
router.delete('/event-types/:id', protect, eventTypeController.deleteEventType);


router.get('/availability', protect, availabilityController.getAvailability);
router.post('/availability', protect, availabilityController.updateAvailability);


router.get('/bookings', protect, bookingController.getBookings);
router.delete('/bookings/:id', protect, bookingController.cancelBooking);


router.get('/event-types/:username/:slug', eventTypeController.getEventTypeBySlug);
router.post('/bookings', bookingController.createBooking);
router.get('/public/slots', bookingController.getAvailableTimeSlots);

module.exports = router;
