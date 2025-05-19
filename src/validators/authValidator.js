const { body } = require("express-validator");

module.exports.registerValidator = [
    body("fullname").isLength({min: 3}).withMessage("firstname must be atleast 3 character"),
    body("email").isEmail().withMessage("Invalid Email"),
    body("password").isLength({ min : 8}).withMessage("Password must be at 8 character long"),
    body("phoneNo").isLength({min : 10}).withMessage("Phone Number must be 10 digit")
]

module.exports.loginValidator = [
    body("email").isEmail().withMessage("Invalid Email!"),
    body("password").isLength({min : 8}).withMessage("Password must be atleast 8 charactor")
]