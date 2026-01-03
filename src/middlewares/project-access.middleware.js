// middlewares/project-access.middleware.js
import { Project } from "../models/project.model.js";
import { ApiError } from "../utils/api-error.js";

export const checkProjectAccess = async (req, res, next) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const userId = req.user._id.toString();

  const isMember = project.members.some(
    (member) => member.user.toString() === userId
  );

  const isCreator = project.createdBy.toString() === userId;

  if (!isMember && !isCreator) {
    throw new ApiError(403, "You do not have access to this project");
  }

  req.project = project;
  next();
};
