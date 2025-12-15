// src/api/subtasks.js
import axios from "./axiosInstance";

export const fetchSubtasks = (projectId, taskId) => {
  return axios.get(`/subtasks/${projectId}/t/${taskId}/subtasks`);
};

export const createSubtask = (projectId, taskId, payload) => {
  return axios.post(`/subtasks/${projectId}/t/${taskId}/subtasks`, payload);
};

export const toggleSubtask = (projectId, subtaskId, payload) => {
  return axios.put(`/subtasks/${projectId}/st/${subtaskId}`, payload);
};

export const deleteSubtask = (projectId, subtaskId) => {
  return axios.delete(`/subtasks/${projectId}/st/${subtaskId}`);
};
