// validations/note.validation.js
import { body } from "express-validator";

export const noteCreateValidator = () => {
  return [
    body("title")
      .notEmpty()
      .withMessage("Note title is required"),
    body("content")
      .optional()
      .isString()
  ];
};

export const noteUpdateValidator = () => {
  return [
    body("title").optional(),
    body("content").optional()
  ];
};
