// validations/subtask.validation.js
import { body } from "express-validator";

export const subtaskCreateValidator = () => {
  return [
    body("title")
      .notEmpty()
      .withMessage("Subtask title is required")
      .isLength({ min: 2 })
      .withMessage("Title must be at least 2 characters")
  ];
};

export const subtaskUpdateValidator = () => {
  return [
    body("title").optional(),
    body("isCompleted")
      .optional()
      .isBoolean()
      .withMessage("isCompleted must be true or false")
  ];
};
