// controllers/project.controller.js
import { Project } from "../models/project.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

// Create Project

export const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const project = await Project.create({
    name,
    description,
    createdBy: req.user._id,
    members: [
      {
        user: req.user._id,
        role: "admin"
      }
    ]
  });

  return res
    .status(201)
    .json(new ApiResponse(201, project, "Project created successfully"));
});

// List Projects for User

export const getUserProjects = asyncHandler(async (req, res) => {
  const projects = await Project.find({
    "members.user": req.user._id
  }).select("name description createdBy members createdAt");

  // Add member count
  const result = projects.map((p) => ({
    ...p._doc,
    memberCount: p.members.length
  }));

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Projects fetched successfully"));
});

// Get Project Details

export const getProjectDetails = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId)
    .populate("createdBy", "username email")
    .populate("members.user", "username email role");

  if (!project) throw new ApiError(404, "Project not found");

  // Check user access
  const isMember = project.members.some(
    (m) => m.user._id.toString() === req.user._id.toString()
  );

  if (!isMember) throw new ApiError(403, "You are not part of this project");

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project details fetched"));
});

// Update Project (Admin Only)

export const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { name, description } = req.body;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  // Only admin can update project
  const isAdmin = project.members.some(
    (m) =>
      m.user.toString() === req.user._id.toString() && m.role === "admin"
  );
  if (!isAdmin) throw new ApiError(403, "Admin access required");

  project.name = name || project.name;
  project.description = description || project.description;
  await project.save();

  return res
    .status(200)
    .json(new ApiResponse(200, project, "Project updated successfully"));
});

// Delete Project (Admin Only)

export const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  const isAdmin = project.members.some(
    (m) =>
      m.user.toString() === req.user._id.toString() && m.role === "admin"
  );

  if (!isAdmin) throw new ApiError(403, "Admin access required");

  await project.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project deleted successfully"));
});
