import { body } from "express-validator";

const userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),

    body("username")
      .trim()
      .notEmpty()
      .withMessage("username is required")
      .isLength({ min: 3 })
      .withMessage("Username must be atleast 3 character")
      .isLowercase()
      .withMessage("Username must be in lowercase"),

    body("password").trim().notEmpty().withMessage("Password is required"),

    body("fullname").trim().optional(),
  ];
};

const userLoginValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),

    body("password").trim().notEmpty().withMessage("Password is required"),
  ];
};

export { userRegisterValidator, userLoginValidator };
