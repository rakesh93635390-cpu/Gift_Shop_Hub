import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:7000/api/auth";

export default async function fetchShops() {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Please log in to view shops.");
  }

  let response;
  try {
    response = await axios.get(`${API_BASE_URL}/shops`, {
      headers: {
        Authorization: "Bearer " + token,
      },
    });
  } catch (error) {
    const message =
      error.response?.data?.message ||
      (error.response?.status === 401
        ? "Your login session has expired. Please log in again."
        : "Unable to load shops. Please check your backend server.");
    throw new Error(message, { cause: error });
  }

  const data = response.data;
  const shops = Array.isArray(data)
    ? data
    : Array.isArray(data?.shops)
      ? data.shops
      : Array.isArray(data?.data)
        ? data.data
        : null;

  if (!shops) {
    throw new Error("Unexpected response while retrieving shops");
  }

  return shops;
}
