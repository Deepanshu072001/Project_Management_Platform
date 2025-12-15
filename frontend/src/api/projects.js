// src/api/projects.js
import axios from "./axiosInstance";

export const fetchProjects = () => axios.get("/projects");

export const createProject = (payload) =>
  axios.post("/projects", payload);

export const getProjectDetails = (projectId) =>
  axios.get(`/projects/${projectId}`);

export const updateProject = (projectId, payload) =>
  axios.put(`/projects/${projectId}`, payload);

export const deleteProject = (projectId) =>
  axios.delete(`/projects/${projectId}`);
