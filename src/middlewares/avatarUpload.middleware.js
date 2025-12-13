// src/middlewares/avatarUpload.middleware.js
import multer from "multer";
import path from "path";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/uploads/avatars");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const userId = req.user?._id || "newuser"; // registration case
    cb(null, `avatar-${userId}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file) return cb(null, true);
  if (!file.mimetype.startsWith("image/")) {
    cb(new Error("Only image files allowed"), false);
  } else {
    cb(null, true);
  }
};

export const uploadAvatar = multer({ storage, fileFilter }).single("avatar");
