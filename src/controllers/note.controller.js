// controllers/note.controller.js
import { Note } from "../models/note.model.js";
import { Project } from "../models/project.model.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";

// Helper: check if user belongs to project
const isMember = (project, userId) =>
  project.members.some((m) => m.user.toString() === userId.toString());

// Helper: only Admin can manage notes
const isAdmin = (project, userId) =>
  project.members.some(
    (m) => m.user.toString() === userId.toString() && m.role === "admin"
  );

// Create Note (Admin Only)

export const createNote = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { title, content } = req.body;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  if (!isAdmin(project, req.user._id))
    throw new ApiError(403, "Admin access required to create notes");

  const note = await Note.create({
    projectId,
    title,
    content,
    createdBy: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, note, "Note created successfully"));
});

// Get All Notes (Members can view)

export const getNotes = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  if (!isMember(project, req.user._id))
    throw new ApiError(403, "You are not part of this project");

  const notes = await Note.find({ projectId })
     .populate("createdBy", "username email");

  return res
    .status(200)
    .json(new ApiResponse(200, notes, "Notes fetched successfully"));
});

// Get Note Details

export const getNoteDetails = asyncHandler(async (req, res) => {
  const { projectId, noteId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  if (!isMember(project, req.user._id))
    throw new ApiError(403, "You are not part of this project");

  const note = await Note.findById(noteId)
      .populate("createdBy", "username email");

  if (!note) throw new ApiError(404, "Note not found");

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note details fetched"));
});

// Update Note (Admin Only)

export const updateNote = asyncHandler(async (req, res) => {
  const { projectId, noteId } = req.params;
  const { title, content } = req.body;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  if (!isAdmin(project, req.user._id))
    throw new ApiError(403, "Admin access required to update notes");

  const note = await Note.findById(noteId);
  if (!note) throw new ApiError(404, "Note not found");

  note.title = title || note.title;
  note.content = content || note.content;
  await note.save();

  return res
    .status(200)
    .json(new ApiResponse(200, note, "Note updated successfully"));
});

// Delete Note (Admin Only)

export const deleteNote = asyncHandler(async (req, res) => {
  const { projectId, noteId } = req.params;

  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, "Project not found");

  if (!isAdmin(project, req.user._id))
    throw new ApiError(403, "Admin access required to delete notes");

  await Note.findByIdAndDelete(noteId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Note deleted successfully"));
});
