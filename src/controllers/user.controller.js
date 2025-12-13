// controllers/user.controller.js
import fs from "fs";
import path from "path";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

export const updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(400, "Avatar file is required");
  }

  const user = await User.findById(req.user._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Delete previous avatar file if stored locally
  if (user.avatar?.localPath) {
    try {
      fs.unlinkSync(user.avatar.localPath);
    } catch (err) {
      console.warn("Failed to delete old avatar:", err.message);
    }
  }

  const newAvatarPath = req.file.path.replace("\\", "/"); // windows fix

  user.avatar = {
    url: `/${newAvatarPath}`,
    localPath: newAvatarPath,
  };

  await user.save({ validateBeforeSave: false });

  return res.status(200).json(
    new ApiResponse(200, { avatar: user.avatar }, "Avatar updated successfully")
  );
});
