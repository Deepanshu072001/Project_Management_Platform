// src/api/members.js
import axios from "./axiosInstance";

export const fetchMembers = (projectId) =>
  axios.get(`/projects/${projectId}/members`);

export const addMember = (projectId, payload) =>
  axios.post(`/projects/${projectId}/members`, payload);

export const updateMemberRole = (projectId, userId, payload) =>
  axios.put(`/projects/${projectId}/members/${userId}`, payload);

export const removeMember = (projectId, userId) =>
  axios.delete(`/projects/${projectId}/members/${userId}`);
