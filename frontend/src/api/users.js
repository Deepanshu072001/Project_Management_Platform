// src/api/users.js
import axios from "./axiosInstance";

// Fetch all users (Admin-only)
export const fetchAllUsers = async () => {
  return await axios.get("/admin/users");
};

// Change user role
export const updateUserRole = async (userId, role) => {
  return await axios.put(`/admin/users/${userId}/role`, { role });
};

// Delete / deactivate user
export const deleteUser = async (userId) => {
  return await axios.delete(`/admin/users/${userId}`);
};
