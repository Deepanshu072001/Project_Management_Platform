// validations/project.validation.js
import { body } from "express-validator";

export const projectCreateValidator = () => {
  return [
    body("name").notEmpty().withMessage("Project name is required"),
    body("description").optional().trim()
  ];
};

export const projectUpdateValidator = () => {
  return [
    body("name").optional().trim(),
    body("description").optional().trim()
  ];
};
