// validations/task.validation.js
import { body } from "express-validator";

export const taskCreateValidator = () => {
  return [
    body("title").notEmpty().withMessage("Title is required"),
    body("assignedTo").optional().isMongoId(),
    body("description").optional()
  ];
};

export const taskUpdateValidator = () => {
  return [
    body("title").optional(),
    body("description").optional(),
    body("status")
      .optional()
      .isIn(["todo", "in_progress", "done"])
      .withMessage("Invalid task status"),
    body("assignedTo").optional().isMongoId()
  ];
};
