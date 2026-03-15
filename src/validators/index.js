import { body, param } from "express-validator";
import { AvailableTaskStatus, AvailableUserRole } from "../utils/constants.js";

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

const userForgotPasswordValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is invalid"),
  ];
};

const resetForgottenPasswordValidator = () => {
  return [
    body("newPassword").trim().notEmpty().withMessage("Password is required"),
  ];
};

const changeCurrentPasswordValidator = () => {
  return [
    body("oldPassword").trim().notEmpty().withMessage("Password is required"),
    body("newPassword").trim().notEmpty().withMessage("Password is required"),
  ];
};

const createProjectValidator = () => {
  return [
    (body("name").notEmpty().withMessage("Project Name is required"),
    body("description").optional()),
  ];
};

const addMembersToProjectValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Email is not valid"),
    body("role")
      .notEmpty()
      .withMessage("role is required")
      .isIn(AvailableUserRole)
      .withMessage("This role doesn't exist"),
  ];
};

const createTaskValidator = () => {
  return [
    body("title").trim().notEmpty().withMessage("Title is required"),
    body("description").trim().optional(),
    body("assignedTo")
      .trim()
      .optional()
      .isMongoId()
      .withMessage("Invalid user ID"),
    param("projectId")
      .trim()
      .notEmpty()
      .withMessage("Project ID is required")
      .isMongoId()
      .withMessage("Invalid Project ID"),
    body("status")
      .trim()
      .optional()
      .isIn(AvailableTaskStatus)
      .withMessage("This status is not valid"),
  ];
};

const createSubTaskValidator = () => {
  return [
    body("title").trim().notEmpty().withMessage("Title is required"),
    param("taskId")
      .trim()
      .notEmpty()
      .withMessage("Task ID is required")
      .isMongoId()
      .withMessage("Invalid Task ID"),
    body("isCompleted")
      .optional()
      .isBoolean()
      .withMessage("isCompleted must be a boolean value"),
  ];
};

const createProjectNoteValidator = () => {
  return [
    body("content").trim().notEmpty().withMessage("Content is required"),
    param("projectId")
      .trim()
      .notEmpty("Project ID is required")
      .isMongoId()
      .withMessage("Invalid Project ID"),
  ];
};

export {
  userRegisterValidator,
  userLoginValidator,
  userForgotPasswordValidator,
  resetForgottenPasswordValidator,
  changeCurrentPasswordValidator,
  addMembersToProjectValidator,
  createProjectValidator,
  createTaskValidator,
  createSubTaskValidator,
  createProjectNoteValidator,
};
