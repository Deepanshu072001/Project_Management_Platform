// routes/subtask.route.js
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validator.middleware.js";
import {
  createSubtask,
  updateSubtask,
  deleteSubtask
} from "../controllers/subtask.controller.js";
import {
  subtaskCreateValidator,
  subtaskUpdateValidator
} from "../validations/subtask.validation.js";

const router = Router();

router.use(verifyJWT);

// Create Subtask
router.post(
  "/:projectId/t/:taskId/subtasks",
  subtaskCreateValidator(),
  validate,
  createSubtask
);

// Update Subtask
router.put(
  "/:projectId/st/:subtaskId",
  subtaskUpdateValidator(),
  validate,
  updateSubtask
);

// Delete Subtask
router.delete("/:projectId/st/:subtaskId", deleteSubtask);

export default router;
