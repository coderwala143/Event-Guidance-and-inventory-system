const express = require('express');
const router = express.Router();
const eventController = require("../controllers/event.controllers.js")
const {protect, adminOnly, adminOrOrganizerOnly} = require('../middlewares/authMiddleware');

router.post('/create-event', protect, adminOrOrganizerOnly, eventController.CreateEvent);

router.get('/all-events', protect, eventController.getAllEvent);

router.get('/get-single-event/:id', protect, eventController.getEventById);

router.get('/register-for-event/:id', protect, eventController.registerForEvent);

router.get('/unregister-from-event/:id', protect, eventController.unregisterFromEvent);

router.get('/invite-for-event/:id', protect, adminOrOrganizerOnly, eventController.inviteForEvent);

router.get('/accept-or-reject-event/:id',  protect, eventController.acceptOrRejectEventInvitation);

router.put('/update-event/:id', protect, adminOrOrganizerOnly, eventController.updateEvent);

router.delete('/delete-event/:id', protect, adminOnly, eventController.deleteEvent);

module.exports = router;
