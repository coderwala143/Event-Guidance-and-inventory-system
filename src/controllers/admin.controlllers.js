const Event = require("../models/events.models");
const User = require("../models/users.models");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const asyncHandler = require("../utils/asyncHandler");

module.exports.setRole = asyncHandler(async (req, res) => {
  const { userId, role } = req.body;
  const user = await User.findOne({ _id: userId });

  if (!user) {
    throw new ApiError(400, "User Not Exists!");
  }
  if (user.role === "organizer") {
    throw new Error(409, "Already set Role to Organizer!");
  }
  const updatedRole = await User.findByIdAndUpdate(
    userId,
    { role },
    { new: true }
  );

  res
    .status(200)
    .json(new ApiResponse(200, updatedRole, "Role Updated Successfully!"));
});

module.exports.makeAdmin = asyncHandler(async (req, res) => {
  const { email, passkey } = req.body;
  if (passkey !== process.env.PASSKEY_FOR_ADMIN) {
    throw new ApiError(401, "Wrong Passkey!");
  }
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "Invalid email or Not exist!");
  }
  let updateToAdmin = await User.findOneAndUpdate(
    { email: email },
    { role: "admin" }
  );
  res.status(200).json(new ApiResponse(200, updateToAdmin, "Updated To Admin"));
});

module.exports.AllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.status(200).json(new ApiResponse(200, users, "All Users!"));
});

module.exports.approveOrRejectEvent = asyncHandler(async (req, res) => {
  const { status } = req.query;
  if (req.user.role !== "admin") {
    throw new ApiError(403, "Only admin can approve events");
  }

  const event = await Event.findById(req.params.id);
  if (!event || event.status !== "Pending") {
    throw new ApiError(404, "Event not found!");
  }
  if (status === "Approved") {
    event.status = status;
    await event.save();
    res
      .status(200)
      .json(new ApiResponse(200, event, "Event Approved Successfully!"));
  } else if (status === "Rejected") {
    const { reason } = req.body;
    event.status = status;
    event.rejectionReason = reason || "";
    await event.save();
    res
      .status(200)
      .json(new ApiResponse(200, event, "Event Rejected!"));
  } else {
    throw new ApiError(400, "Invalid Value for event approve and rejection");
  }
});
