import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:7000/api/auth";

export async function getOrderHistory() {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Please log in to view your order history.");
  }

  const response = await axios.get(`${API_BASE_URL}/orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const orders = response.data?.orders;

  if (!Array.isArray(orders)) {
    throw new Error("Unexpected response while retrieving order history.");
  }

  return orders;
}
