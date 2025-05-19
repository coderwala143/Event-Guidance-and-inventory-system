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
  if(user.role === "organizer"){
    throw new Error(409, "Already set Role to Organizer!")
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
  if(passkey !== process.env.PASSKEY_FOR_ADMIN){
      throw new ApiError(401, "Wrong Passkey!")
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

module.exports.AllUsers = asyncHandler(async(req, res) => {
    const users = await User.find({});
    res.status(200).json(new ApiResponse(200, user, "All Users!"))
})