// controllers/subtask.controller.js
import { Subtask } from "../models/subtask.model.js";
import { Task } from "../models/task.model.js";
import { Project } from "../models/project.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

// helper: check membership
const checkMember = (project, userId) =>
  project.members.some((m) => m.user.toString() === userId.toString());

// helper: admin or project admin
const checkManager = (project, userId) =>
  project.members.some(
    (m) =>
      m.user.toString() === userId.toString() &&
      ["admin", "project_admin"].includes(m.role)
  );

// Create Subtask

export const createSubtask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const { title } = req.body;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  if (!checkManager(project, req.user._id))
    throw new ApiError(403, "Only Admin or Project Admin may create subtasks");

  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, "Task not found");

  const subtask = await Subtask.create({
    projectId,
    taskId,
    title,
    createdBy: req.user._id
  });

  return res
    .status(201)
    .json(new ApiResponse(201, subtask, "Subtask created successfully"));
});

// Update Subtask (title or status)

export const updateSubtask = asyncHandler(async (req, res) => {
  const { projectId, subtaskId } = req.params;
  const { title, isCompleted } = req.body;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  const subtask = await Subtask.findById(subtaskId);
  if (!subtask) throw new ApiError(404, "Subtask not found");

  // Member can ONLY toggle completion
  if (!checkManager(project, req.user._id)) {
    if (typeof isCompleted !== "undefined") {
      subtask.isCompleted = isCompleted;
      subtask.completedBy = isCompleted ? req.user._id : null;

      await subtask.save();

      return res
        .status(200)
        .json(
          new ApiResponse(200, subtask, "Subtask status updated (member action)")
        );
    }

    throw new ApiError(403, "Members cannot modify subtask details");
  }

  // Admin/project admin can update title + status
  if (title) subtask.title = title;
  if (typeof isCompleted !== "undefined") {
    subtask.isCompleted = isCompleted;
    subtask.completedBy = isCompleted ? req.user._id : null;
  }

  await subtask.save();

  return res
    .status(200)
    .json(new ApiResponse(200, subtask, "Subtask updated successfully"));
});

// Delete Subtask (Admin/Project Admin)

export const deleteSubtask = asyncHandler(async (req, res) => {
  const { projectId, subtaskId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  if (!checkManager(project, req.user._id))
    throw new ApiError(403, "Admin or Project Admin required");

  await Subtask.findByIdAndDelete(subtaskId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Subtask deleted successfully"));
});
