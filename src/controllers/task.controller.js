// controllers/task.controller.js
import { Task } from "../models/task.model.js";
import { Project } from "../models/project.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

// Helper: check if user belongs to project
const checkMember = (project, userId) => {
  return project.members.some(
    (m) => m.user.toString() === userId.toString()
  );
};

// Helper: check admin or project_admin
const checkManager = (project, userId) => {
  return project.members.some(
    (m) =>
      m.user.toString() === userId.toString() &&
      ["admin", "project_admin"].includes(m.role)
  );
};

// Create Task

export const createTask = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { title, description, assignedTo } = req.body;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  if (!checkManager(project, req.user._id))
    throw new ApiError(403, "Only Admin or Project Admin can create tasks");

  if (assignedTo) {
    const validAssignee = checkMember(project, assignedTo);
    if (!validAssignee) throw new ApiError(400, "Assigned user is not a project member");
  }

  const attachments = (req.files || []).map((file) => ({
    filename: file.filename,
    url: `/uploads/${file.filename}`,
    mimetype: file.mimetype,
    size: file.size
  }));

  const task = await Task.create({
    projectId,
    title,
    description,
    assignedTo,
    attachments,
    createdBy: req.user._id
  });

  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created successfully"));
});

// List Tasks in Project

export const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  if (!checkMember(project, req.user._id))
    throw new ApiError(403, "Access denied");

  const tasks = await Task.find({ projectId });

  return res
    .status(200)
    .json(new ApiResponse(200, tasks, "Tasks fetched successfully"));
});

// Task Details

export const getTaskDetails = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  if (!checkMember(project, req.user._id))
    throw new ApiError(403, "Access denied");

  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, "Task not found");

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task details fetched"));
});

// Update Task

export const updateTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;
  const { title, description, status, assignedTo } = req.body;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  if (!checkManager(project, req.user._id))
    throw new ApiError(403, "Only Admin or Project Admin can update tasks");

  const task = await Task.findById(taskId);
  if (!task) throw new ApiError(404, "Task not found");

  if (assignedTo) {
    if (!checkMember(project, assignedTo))
      throw new ApiError(400, "Assigned user is not in this project");
  }

  task.title = title || task.title;
  task.description = description || task.description;
  task.status = status || task.status;
  task.assignedTo = assignedTo || task.assignedTo;

  await task.save();

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task updated successfully"));
});

// Delete Task

export const deleteTask = asyncHandler(async (req, res) => {
  const { projectId, taskId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  if (!checkManager(project, req.user._id))
    throw new ApiError(403, "Admin or Project Admin required");

  await Task.findByIdAndDelete(taskId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Task deleted successfully"));
});
