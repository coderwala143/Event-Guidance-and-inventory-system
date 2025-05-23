const jwt = require("jsonwebtoken");
const User = require("../models/users.models");
const ApiError = require("../utils/ApiError");
const BlackListedToken = require("../models/isBlackListed.models");

module.exports.protect = async (req, res, next) => {
  let token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) throw new ApiError(401, "Unauthorized!");

  const isBlackListed = await BlackListedToken.findOne({token});
  if(isBlackListed) throw new ApiError(401, "Unauthorized!");
  
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded._id).select("-password");

  if (!user) {
    throw new ApiError(401, "User not found");
  }
  req.user = user;
  return next();
};

module.exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== "admin") {
    throw new ApiError(403, "Admin access only")
  }
  next();
};


module.exports.adminOrOrganizerOnly = (req, res, next) => {
  if (req.user.role === 'admin' || req.user.role === 'organizer') {
    return next();
  }
  return res.status(403).json({ message: 'Access denied' });
};
