const { body } = require("express-validator");

module.exports.registerValidator = [
  body("fullname")
    .isLength({ min: 3 })
    .withMessage("firstname must be atleast 3 character"),
  body("email").isEmail().withMessage("Invalid Email"),
  body("password")
    .isLength({ min: 8 })
    .isStrongPassword({
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    })
    .withMessage(
      "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),

  body("phoneNo")
    .isLength({ min: 10 })
    .withMessage("Phone Number must be 10 digit"),
];

module.exports.loginValidator = [
  body("email").isEmail().withMessage("Invalid Email!"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be atleast 8 charactor"),
];
