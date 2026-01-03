// controllers/member.controller.js
import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";



// Add Member to Project

export const addMemberToProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { email, role } = req.body;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  // Only admin can add members
  const isAdmin = project.members.some(
    (m) => m.user.toString() === req.user._id.toString() && m.role === "admin"
  );
  if (!isAdmin) throw new ApiError(403, "Admin role required");

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  // Check if already in project
  const alreadyMember = project.members.some(
    (m) => m.user.toString() === user._id.toString()
  );
  if (alreadyMember) throw new ApiError(409, "User already a project member");

  // Add member
  project.members.push({
    user: user._id,
    role: role || "member"
  });

  await project.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Member added to project"));
});

// Get All Members

export const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId).populate(
    "members.user",
    "username email role"
  );

  if (!project) throw new ApiError(404, "Project not found");

  // Check project access
  const isMember = project.members.some(
    (m) => m.user._id.toString() === req.user._id.toString()
  );
  if (!isMember) throw new ApiError(403, "Access denied");

  return res
    .status(200)
    .json(new ApiResponse(200, project.members, "Members fetched"));
});

// Update Member Role (Admin Only)

export const updateMemberRole = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { role } = req.body;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  // Only admin can update roles
  const isAdmin = project.members.some(
    (m) => m.user.toString() === req.user._id.toString() && m.role === "admin"
  );
  if (!isAdmin) throw new ApiError(403, "Admin role required");

  const member = project.members.find(
    (m) => m.user.toString() === userId.toString()
  );
  if (!member) throw new ApiError(404, "Member not found");

  member.role = role;
  await project.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Member role updated"));
});

// Remove Member (Admin Only)

export const removeProjectMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  // Only admin can remove
  const isAdmin = project.members.some(
    (m) => m.user.toString() === req.user._id.toString() && m.role === "admin"
  );
  if (!isAdmin) throw new ApiError(403, "Admin role required");

  project.members = project.members.filter(
    (m) => m.user.toString() !== userId.toString()
  );

  await project.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Member removed from project"));
});
