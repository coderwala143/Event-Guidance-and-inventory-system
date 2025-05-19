const express = require('express');
const router = express.Router();
const eventController = require("../controllers/event.controllers.js")
const {protect, adminOnly, organizerOnly} = require('../middlewares/authMiddleware');

router.post('/create-event', protect, adminOnly || organizerOnly, eventController.CreateEvent);
router.get('/all-events', protect, eventController.getAllEvent);
router.get('/get-single-event/:id', protect, eventController.getEventById);
router.put('/update-event/:id', protect, adminOnly || organizerOnly, eventController.updateEvent);
router.delete('/delete-event/:id', protect, adminOnly || organizerOnly, eventController.deleteEvent);

module.exports = router;
