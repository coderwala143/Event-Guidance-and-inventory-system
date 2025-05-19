const { body } = require("express-validator");

module.exports.eventValidator = [
    body("title").isEmpty().isLength({min: 3}).withMessage("Title is required"),
    body("description").isEmpty().isLength({min: 10, max: 1000}).withMessage("Description is Required"),
    body("venue").isEmpty().isLength({min: 5}).withMessage("Event venue must at least 5 character long"),
    body('date').isDate().withMessage("Please fill a vaild date"),
    body('time').isTime().withMessage("Please fill a valid time")
]