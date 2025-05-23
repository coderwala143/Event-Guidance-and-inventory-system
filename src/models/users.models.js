const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: true,
    minLength: [3, "fullname must be atleast 3 character long"],

  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: { 
    type: String, 
    required: true,
    minLength: [8, "Password must be atleast 8 character long"],
    // match: /^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/
  },
  phoneNo: {
    type: String,
    required: true,
    minLength: [10, "Phone Number must be 10 Digit Long"]
  },
  role: {
    type: String,
    enum: ["admin", "organizer", "attendee"],
    default: "attendee",
  },
  invitation: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event"
    }
  ]
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAuthToken = function (){
    return jwt.sign({_id: this._id, role: this.role}, process.env.JWT_SECRET, {expiresIn: '24h'});
}

userSchema.statics.verifyJWT = function (token, JWT_SECRET){
    return jwt.verify(token, JWT_SECRET);
}

const User = mongoose.models.User || mongoose.model("User", userSchema);
module.exports = User;