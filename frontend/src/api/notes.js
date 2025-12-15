// src/api/notes.js
import axios from "./axiosInstance";

// GET all notes for a project
export const fetchNotes = (projectId) =>
  axios.get(`/notes/${projectId}`);

// CREATE note (Admin only)
export const createNote = (projectId, payload) =>
  axios.post(`/notes/${projectId}`, payload);

// UPDATE note
export const updateNote = (projectId, noteId, payload) =>
  axios.put(`/notes/${projectId}/n/${noteId}`, payload);

// DELETE note
export const deleteNote = (projectId, noteId) =>
  axios.delete(`/notes/${projectId}/n/${noteId}`);
