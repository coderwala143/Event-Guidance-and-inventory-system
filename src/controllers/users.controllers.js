const { validationResult } = require("express-validator");
const User = require("../models/users.models.js");
const ApiError = require("../utils/ApiError.js");
const asyncHandler = require("../utils/asyncHandler.js");
const ApiResponse = require("../utils/ApiResponse.js");
const BlackListedToken = require("../models/isBlackListed.models.js");
const { sendEmail } = require("../utils/nodemailer.js")
// Tested
module.exports.register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, "validation failed", errors.array());
  }
  const { fullname, email, password, phoneNo } = req.body;
  if ([fullname, email, password, phoneNo].some((field) => !field?.trim())) {
    throw new ApiError(400, "All field required!");
  }

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "User already exists!");

  const user = await User.create({ fullname, email, password, phoneNo });
  const token = user.generateAuthToken();
  await sendEmail(fullname, email)
  res
    .status(201)
    .json(new ApiResponse(200, user, "Account Created Successfully!", token));
});

// Tested
module.exports.login = asyncHandler(async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    throw new ApiError(400, "validation failed", errors.array());
  }
  
  const {email, password} = req.body;
  if(!email?.trim() || !password?.trim()){
    throw new ApiError(400, "All Field required!");
  }

  const user = await User.findOne({email}).select("+password");
  if(!user){
    throw new ApiError(400, "User Not exists!");
  } 
  const isMatch = await user.comparePassword(password);
  if(!isMatch){
    throw new ApiError(400, "Invalid Email or Password!");
  }

  const token = user.generateAuthToken();

  res.cookie("token", token, {domain: "localhost", maxAge: 24 * 60 * 60 * 1000})

  res.status(200).json(new ApiResponse(200, user, "Login Successfully!", token))
});

// Tested
module.exports.logout = asyncHandler(async(req, res) => {
  console.log("token - ",req.cookies.token)
  let token = req.cookies?.token || req.headers.authorization?.split(" ")[1];
  const user = await User.findById(req.user._id);
  console.log(user)
  if(!user){
    throw new ApiError(401, "Unauthorized")
  }
  res.clearCookie("token");
  await BlackListedToken.create({token});
  res.status(200).json(new ApiResponse(200, null, "Logout Successfully!"))
})

module.exports.forgetPassWord = asyncHandler(async(req, res) => {

})