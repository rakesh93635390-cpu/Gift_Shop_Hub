import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:7000/api/auth";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Please log in to manage orders.");
  }

  return { Authorization: `Bearer ${token}` };
}

function getRequestError(error, fallback) {
  return (
    error.response?.data?.message ||
    (error.response?.status === 401
      ? "Your login session has expired. Please log in again."
      : fallback)
  );
}

export async function getAdminOrders() {
  try {
    const response = await axios.get(`${API_BASE_URL}/admin/orders`, {
      headers: getAuthHeaders(),
    });
    if (!Array.isArray(response.data?.orders)) {
      throw new Error("Unexpected response while retrieving orders.");
    }
    return response.data.orders;
  } catch (error) {
    if (error instanceof Error && !error.response) throw error;
    throw new Error(getRequestError(error, "Unable to load orders."), {
      cause: error,
    });
  }
}

export async function updateAdminOrderStatus(orderId, orderStatus) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/admin/order/${orderId}/status`,
      { orderStatus },
      { headers: getAuthHeaders() }
    );
    if (!response.data?.order) {
      throw new Error("Unexpected response while updating order status.");
    }
    return response.data.order;
  } catch (error) {
    if (error instanceof Error && !error.response) throw error;
    throw new Error(getRequestError(error, "Unable to update order status."), {
      cause: error,
    });
  }
}
