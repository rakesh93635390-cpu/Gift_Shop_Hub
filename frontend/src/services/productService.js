import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:7000/api/auth";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Please log in to access products.");
  }

  return { Authorization: `Bearer ${token}` };
}

function getProductError(error, fallback) {
  return (
    error.response?.data?.message ||
    (error.response?.status === 401
      ? "Your login session has expired. Please log in again."
      : fallback)
  );
}

export default async function fetchProducts() {
  try {
    const response = await axios.get(`${API_BASE_URL}/products`, {
      headers: getAuthHeaders(),
    });
    const products = response.data?.products;

    if (!Array.isArray(products)) {
      throw new Error("Unexpected response while retrieving products");
    }

    return products;
  } catch (error) {
    if (error instanceof Error && !error.response) throw error;
    throw new Error(getProductError(error, "Unable to retrieve products."), {
      cause: error,
    });
  }
}

export async function createProduct(productData) {
  try {
    const response = await axios.post(`${API_BASE_URL}/product`, productData, {
      headers: getAuthHeaders(),
    });
    return response.data.product;
  } catch (error) {
    if (error instanceof Error && !error.response) throw error;
    throw new Error(getProductError(error, "Unable to create product."), {
      cause: error,
    });
  }
}

export async function updateProduct(productId, productData) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/product/${productId}`,
      productData,
      { headers: getAuthHeaders() }
    );
    return response.data.product;
  } catch (error) {
    if (error instanceof Error && !error.response) throw error;
    throw new Error(getProductError(error, "Unable to update product."), {
      cause: error,
    });
  }
}

export async function deleteProduct(productId) {
  try {
    await axios.delete(`${API_BASE_URL}/product/${productId}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    if (error instanceof Error && !error.response) throw error;
    throw new Error(getProductError(error, "Unable to delete product."), {
      cause: error,
    });
  }
}
