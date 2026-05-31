const { body, validationResult } = require("express-validator");

const registrationValidators = [
  body("name").isLength({ min: 5, max: 20 }).withMessage("Name must be 5-20 chars"),
  body("email").isEmail().withMessage("Valid email required"),
  body("address").isLength({ max: 400 }).withMessage("Address max 400 chars"),
  body("password")
    .matches(/^(?=.{8,16}$)(?=.*[A-Z])(?=.*[!@#$%^&*()_\-+=\[\]{};':"\\|,.<>\/?]).*$/)
    .withMessage("Password 8-16 chars, include uppercase and special char"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
    next();
  }
];

module.exports = { registrationValidators };
