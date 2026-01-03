// validations/member.validation.js
import { body } from "express-validator";

export const memberAddValidator = () => {
  return [
    body("email").notEmpty().isEmail().withMessage("Valid email required"),
    body("role")
      .optional()
      .isIn(["admin", "project_admin", "member"])
      .withMessage("Invalid role")
  ];
};

export const memberRoleUpdateValidator = () => {
  return [
    body("role")
      .notEmpty()
      .isIn(["admin", "project_admin", "member"])
      .withMessage("Invalid role")
  ];
};
