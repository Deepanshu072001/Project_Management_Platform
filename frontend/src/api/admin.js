// src/api/admin.js
import axios from "./axiosInstance";

// Ban / Unban user
export const banUser = async (userId, ban = true) => {
  return await axios.put(`/admin/users/${userId}/ban`, { ban });
};

// Delete user
export const deleteUser = async (userId) => {
  return await axios.delete(`/admin/users/${userId}`);
};

// Change user role
export const changeUserRole = async (userId, role) => {
  return await axios.put(`/admin/users/${userId}/role`, { role });
};

// Transfer project ownership
export const transferProject = async (projectId, newOwnerId) => {
  return await axios.post(`/admin/projects/${projectId}/transfer`, {
    newOwnerId,
  });
};

// Optional: Admin dashboard summary data
export const getAdminDashboard = async () => {
  return await axios.get("/admin/dashboard");
};

// Optional: Stats
export const getUserStats = async () => axios.get("/admin/stats/users");
export const getProjectStats = async () => axios.get("/admin/stats/projects");
export const getTaskStats = async () => axios.get("/admin/stats/tasks");
export const getRecentActivity = async () =>
  axios.get("/admin/activity/recent");
