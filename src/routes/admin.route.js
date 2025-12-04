// routes/admin.route.js
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import {
  getAdminDashboard,
  getUserStats,
  getProjectStats,
  getTaskStats,
  getRecentActivity
} from "../controllers/admin.controller.js";

const router = Router();

// All admin dashboard routes require login
router.use(verifyJWT);

router.get("/dashboard", getAdminDashboard);
router.get("/users", getUserStats);
router.get("/projects", getProjectStats);
router.get("/tasks", getTaskStats);
router.get("/activity", getRecentActivity);

export default router;
