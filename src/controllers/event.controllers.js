const { validationResult } = require("express-validator");
const Event = require("../models/events.models");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/users.models");
// Tested
module.exports.CreateEvent = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "Validation Failed!", errors.array());
  }
  const { title, description, date, time, venue, maxAttendees } = req.body;
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
    maxAttendees: maxAttendees,
  });
  res
    .status(201)
    .json(new ApiResponse(201, event, "Event Created Successfully!"));
});

// Tested
module.exports.getAllEvent = asyncHandler(async (req, res) => {
  const today = new Date();
  if (req.user.role === "admin") {
    const events = await Event.find({ date: { $gte: today } })
      .sort({ date: 1 })
      .populate("organizer", "name email");
    return res.status(200).json(new ApiResponse(200, events, "All events"));
  }
  let filter = {
    date: { $gte: today },
  };
  if (req.user.role === "organizer") {
    filter.organizer = req.user._id;
  } else if (req.user.role !== "admin") {
    filter.status = "Approved";
  }

  const events = await Event.find(filter)
    .sort({ date: 1 })
    .populate("organizer", "name email");

  if (req.user.role === "organizer" && events.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "You haven't created any event!"));
  }
  if (events.length === 0) {
    return res
      .status(404)
      .json(new ApiResponse(404, null, "No upcomings events found"));
  }
  res.status(200).json(new ApiResponse(200, events, "All Upcomings events"));
});

//Not Tested
module.exports.getEventById = asyncHandler(async (req, res) => {
  const id = req.params.id;
  const query = {
    _id: id,
  };
  if (req.user.role === "organizer") {
    query.organizer = req.user._id;
  } else if (req.user.role !== "admin") {
    query.status = "Approved";
  } else {
  }
  const event = await Event.findOne(query)
    .populate("organizer", "name email")
    .populate("attendees", "name email");

  if (!event) throw new ApiError("Event not found");
  res.status(200).json(new ApiResponse(200, event, "Single Event fetched!"));
});

// Tested
module.exports.registerForEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event || event.status === "Pending") {
    throw new ApiError(404, "Event not available for registration");
  }

  if (event.attendees.includes(req.user._id)) {
    throw new ApiError(400, "Already Registered for this event!");
  }
  if (event.attendees && event.attendees.length >= event.maxAttendees) {
    throw new ApiError(400, "Event is full");
  }
  event.attendees.push(req.user._id);
  await event.save();
  res.status(200).json(new ApiResponse(200, null, "Register for a Event"));
});

//Not Tested
module.exports.inviteForEvent = asyncHandler(async (req, res) => {
  const inviteId = req.query.inviteId;
  const { id: eventId } = req.params;
  const event = await Event.findById(eventId);
  const user = await User.findById(inviteId);
  if (!user) {
    throw new ApiError(404, "User Not Found!");
  }
  if (!event || event.status !== "Approved") {
    throw new ApiError(404, "Event Not Found or Not Approved!");
  }
  if (user.invitation.includes(eventId)) {
    throw new ApiError(400, "User already invited to this event");
  }
  user.invitation.push(req.params.id);
  await user.save();
  res
    .status(200)
    .json(new ApiResponse(200, null, "Event Invitation Sended Successfully!"));
});

//Not Tested
module.exports.acceptOrRejectEventInvitation = asyncHandler(
  async (req, res) => {
    const { invite } = req.query;
    const { id: eventId } = req.params.id;
    const event = await Event.findById(eventId);
    const user = await User.findById(req.user._id);
    if (!user) {
      throw new ApiError(404, "User Not Found!");
    }
    if(!event || event.status !== "Approved"){
      throw new ApiError(404, "Event Not Found or Not Approved!");

    }
    const isInvited = user.invitation.includes(eventId);
    if (!isInvited) {
      throw new ApiError(400, "No event Request!");
    }
    if (invite === "accept") {
      if (event.attendees.includes(req.user._id)) {
        throw new ApiError(409, "Already registered for this event");
      }
      if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
        throw new ApiError(400, "Event is full");
      }

      event.attendees.push(req.user._id);
      user.invitation.pull(eventId);
      await event.save();
      await user.save();
      return res
        .status(200)
        .json(
          new ApiResponse(200, null, "Event Invitation Accepted Successfully!")
        );
    } 
    if (invite === "reject") {
      user.invitation.pull(req.params.id);
      await user.save();
      return res
        .status(200)
        .json(new ApiResponse(200, null, "Event Invitation Rejected!"));
    } 
    throw new ApiError(400, "Invalid invite action. Use 'accept' or 'reject'");
  }
);

//Not Tested
module.exports.unregisterFromEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if(!event){
    throw new ApiError(404, "Event Not Found!")
  }
  if (!event.attendees.includes(req.user._id)) {
    throw new ApiError(400, "You are not registered for this event");
  }
  event.attendees.pull(req.user._id);
  await event.save();
  res
    .status(200)
    .json(new ApiResponse(200, null, "Unregister From Event Successfully!"));
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
    date = eventDate;
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
  event.status = "Pending";

  const updatedEvent = await event.save();
  res
    .status(200)
    .json(new ApiResponse(200, updatedEvent, "Event Updated Successfully!"));
});

// Tested
module.exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) throw new ApiError(404, "Event Not Found!");

  if (req.user.role !== "admin") {
    throw new ApiError(403, "Unauthorized!");
  }

  await event.deleteOne();
  // res.json({ message: "Event deleted successfully" });
  res
    .status(200)
    .json(new ApiResponse(200, null, "Event deleted Successfully!"));
});
