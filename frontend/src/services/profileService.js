import axios from "axios";

const API_BASE_URL = "http://localhost:7000/api/auth";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return { Authorization: `Bearer ${token}` };
}

export function getProfile() {
  return axios.get(`${API_BASE_URL}/profile`, {
    headers: getAuthHeaders(),
  });
}

export function updateProfile(profileData) {
  return axios.put(`${API_BASE_URL}/profile`, profileData, {
    headers: getAuthHeaders(),
  });
}

export function changePassword(passwordData) {
  return axios.put(`${API_BASE_URL}/change-password`, passwordData, {
    headers: getAuthHeaders(),
  });
}
