// routes/project.route.js
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { requireRole } from "../middlewares/role.middleware.js";
import { checkProjectAccess } from "../middlewares/project-access.middleware.js";

import {
  createProject,
  getUserProjects,
  getProjectDetails,
  updateProject,
  deleteProject
} from "../controllers/project.controller.js";
import {
  projectCreateValidator,
  projectUpdateValidator
} from "../validations/project.validation.js";

import { validate } from "../middlewares/validator.middleware.js";

const router = Router();

// List user projects
router.get("/", verifyJWT, getUserProjects);

// Create project (Admin only)
router.post(
  "/",
  verifyJWT,
  requireRole("admin"),
  projectCreateValidator(),
  validate,
  createProject
);

// Get project by ID
router.get("/:projectId", verifyJWT, checkProjectAccess, getProjectDetails);

// Update project (Admin only)
router.put(
  "/:projectId",
  verifyJWT,
  requireRole("admin"),
  projectUpdateValidator(),
  validate,
  updateProject
);

// Delete project (Admin only)
router.delete(
  "/:projectId",
  verifyJWT,
  requireRole("admin"),
  deleteProject
);

export default router;
