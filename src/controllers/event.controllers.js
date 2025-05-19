const { validationResult } = require("express-validator");
const Event = require("../models/events.models");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
// Tested
module.exports.CreateEvent = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Failed!", errors.array());
  }
  const { title, description, date, time, venue } = req.body;
  if ([title, description, date, time, venue].some((field) => !field?.trim())) {
    throw new ApiError(400, "All field required!");
  }

  const eventDate = new Date(date);
  if (isNaN(eventDate.getTime())) {
    throw new ApiError(400, "Invalid date format");
  }
  if (eventDate < new Date()) {
    throw new ApiError(400, "Event date must be in the future");
  }

  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    throw new ApiError(400, "Invalid time format. Use HH:MM (24-hour format)");
  }

  const event = await Event.create({
    title,
    description,
    date: eventDate,
    time,
    venue,
    organizer: req.user._id,
  });
  res
    .status(201)
    .json(new ApiResponse(201, event, "Event Created Successfully!"));
});

// Tested
module.exports.getAllEvent = asyncHandler(async (req, res) => {
  const today = new Date();
  const events = await Event.find({ date: { $gte: today } })
    .sort({ date: 1 })
    .populate("organizer", "name email");
  if (events.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "No upcomings events found"));
  }
  res.status(200).json(new ApiResponse(200, events, "All Upcomings events"));
});

// Tested
module.exports.getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate("organizer", "name email")
    .populate("attendees", "name email")
    .populate("inventoryAssigned");
  if (!event) throw new ApiError("Event not found");
  res.status(200).json(new ApiResponse(200, event, "Single Event fetched!"));
});

// Tested
module.exports.updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) throw new ApiError("Event not found!");

  if (
    event.organizer.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({ message: "Unauthorized" });
  }

  const { title, description, date, time, venue } = req.body;
  if (date) {
      const eventDate = new Date(date);
    if (isNaN(eventDate.getTime())) {
      throw new ApiError(400, "Invalid date format");
    }
    if (eventDate < new Date()) {
      throw new ApiError(400, "Event date must be in the future");
    }
  }

  if (time) {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(time)) {
      throw new ApiError(
        400,
        "Invalid time format. Use HH:MM (24-hour format)"
      );
    }
  }
  event.title = title || event.title;
  event.description = description || event.description;
  event.date = date || event.date;
  event.time = time || event.time;
  event.venue = venue || event.venue;

  const updatedEvent = await event.save();
  res
    .status(200)
    .json(new ApiResponse(200, updatedEvent, "Event Updated Successfully!"));
});

// Tested
module.exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, "Event Not Found!");

  if (
    event.organizer.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "Unauthorized!");
  }

  await event.deleteOne();
  res.json({ message: "Event deleted successfully" });
  res
    .status(200)
    .json(new ApiResponse(200, null, "Event deleted Successfully!"));
});
