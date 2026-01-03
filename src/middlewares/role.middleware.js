// middlewares/role.middleware.js
import { ApiError } from "../utils/api-error.js";

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      throw new ApiError(403, "You are not authorized to perform this action");
    }
    next();
  };
};
