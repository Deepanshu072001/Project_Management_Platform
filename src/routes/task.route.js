// routes/task.route.js
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import multer from "multer";

import {
  createTask,
  getTasks,
  getTaskDetails,
  updateTask,
  deleteTask
} from "../controllers/task.controller.js";

import {
  taskCreateValidator,
  taskUpdateValidator
} from "../validations/task.validation.js";
import { validate } from "../middlewares/validator.middleware.js";

const router = Router();

// File upload handling
const upload = multer({
  dest: "public/uploads"
});

// All routes require authentication
router.use(verifyJWT);

router
  .route("/:projectId")
  .get(getTasks)
  .post(upload.array("attachments", 5), taskCreateValidator(), validate, createTask);

router
  .route("/:projectId/t/:taskId")
  .get(getTaskDetails)
  .put(taskUpdateValidator(), validate, updateTask)
  .delete(deleteTask);

export default router;
