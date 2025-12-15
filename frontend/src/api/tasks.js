// src/api/tasks.js
import axios from "./axiosInstance";

// GET all tasks for a project
export const fetchTasks = (projectId) =>
  axios.get(`/tasks/${projectId}`);

// CREATE new task
export const createTask = (projectId, payload) =>
  axios.post(`/tasks/${projectId}`, payload);

// GET task details
export const getTaskDetails = (projectId, taskId) =>
  axios.get(`/tasks/${projectId}/t/${taskId}`);

// UPDATE task
export const updateTask = (projectId, taskId, payload) =>
  axios.put(`/tasks/${projectId}/t/${taskId}`, payload);

// DELETE task
export const deleteTask = (projectId, taskId) =>
  axios.delete(`/tasks/${projectId}/t/${taskId}`);
