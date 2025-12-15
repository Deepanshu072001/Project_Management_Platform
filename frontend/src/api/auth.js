// src/api/auth.js
import axios from "./axiosInstance";

export const register = (formData) => {
  // formData is FormData object for multipart/form-data
  return axios.post("/auth/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const login = (payload) => {
  return axios.post("/auth/login", payload);
};

export const logout = () => axios.post("/auth/logout");

export const getCurrentUser = () => axios.get("/auth/current-user");
export const changePassword = (payload) =>
  axios.post("/auth/change-password", payload);

// If you want an explicit refresh endpoint call
export const refreshToken = () => axios.post("/auth/refresh-token");
