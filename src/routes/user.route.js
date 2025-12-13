// routes/user.route.js
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/avatarUpload.middleware.js";
import { updateAvatar } from "../controllers/user.controller.js";

const router = Router();

router.put("/avatar", verifyJWT, uploadAvatar, updateAvatar);

export default router;
