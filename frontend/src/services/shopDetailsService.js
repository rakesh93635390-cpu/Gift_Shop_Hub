import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:7000/api/auth";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Please log in to view shop details.");
  }

  return { Authorization: `Bearer ${token}` };
}

function getRequestError(error, fallback) {
  return new Error(
    error.response?.data?.message ||
      (error.response?.status === 401
        ? "Your login session has expired. Please log in again."
        : fallback),
    { cause: error }
  );
}

export async function getShopDetails(shopId) {
  try {
    const response = await axios.get(`${API_BASE_URL}/shop/${shopId}`, {
      headers: getAuthHeaders(),
    });
    const shop = response.data?.shop;

    if (!shop) {
      throw new Error("Unexpected response while retrieving shop details.");
    }

    return shop;
  } catch (error) {
    if (error instanceof Error && !error.response) throw error;
    throw getRequestError(error, "Unable to retrieve shop details.");
  }
}

export async function getShopProducts(shopId) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/products/shop/${shopId}`,
      { headers: getAuthHeaders() }
    );
    const products = response.data?.products;

    if (!Array.isArray(products)) {
      throw new Error("Unexpected response while retrieving shop products.");
    }

    return products;
  } catch (error) {
    if (error instanceof Error && !error.response) throw error;
    throw getRequestError(error, "Unable to retrieve this shop's products.");
  }
}
