import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:7000/api/auth";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Please log in to manage shops.");
  }

  return { Authorization: `Bearer ${token}` };
}

function getShopError(error, fallback) {
  return (
    error.response?.data?.message ||
    (error.response?.status === 401
      ? "Your login session has expired. Please log in again."
      : fallback)
  );
}

function normalizeShop(shop) {
  if (!shop || typeof shop !== "object") {
    throw new Error("Unexpected response while retrieving shop information.");
  }

  return {
    id: shop._id || shop.id,
    owner:
      shop.shopOwner &&
      typeof shop.shopOwner === "object" &&
      (typeof shop.shopOwner.name === "string" ||
        typeof shop.shopOwner.email === "string")
        ? {
            name: shop.shopOwner.name || "",
            email: shop.shopOwner.email || "",
          }
        : null,
    name: shop.shopName || shop.name || "",
    description: shop.shopDescription || shop.description || "",
    location: shop.shopLocation || shop.location || "",
    address: shop.shopAddress || shop.address || "",
    phone: shop.shopContact == null
      ? shop.phone || ""
      : String(shop.shopContact),
    email: shop.shopEmail || shop.email || "",
    status:
      (shop.shopStatus || shop.status || "").toLowerCase() === "active"
        ? "Active"
        : "Pending",
    image: shop.shopImage || shop.image || "",
  };
}

function toApiShop(shop) {
  const phoneDigits = shop.phone.replace(/\D/g, "");

  return {
    shopName: shop.name,
    shopDescription: shop.description,
    shopLocation: shop.location,
    shopAddress: shop.address,
    shopContact: phoneDigits ? Number(phoneDigits) : undefined,
    shopEmail: shop.email,
    shopStatus: shop.status.toLowerCase(),
    shopImage: shop.image,
  };
}

async function getShops() {
  try {
    const response = await axios.get(`${API_BASE_URL}/shops`, {
      headers: getAuthHeaders(),
    });
    const shops = response.data?.shops;

    if (!Array.isArray(shops)) {
      throw new Error("Unexpected response while retrieving shops.");
    }

    return shops.map(normalizeShop);
  } catch (error) {
    if (error instanceof Error && !error.response) throw error;
    throw new Error(getShopError(error, "Unable to load shops."), {
      cause: error,
    });
  }
}

async function createShop(shop) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/shop`,
      toApiShop(shop),
      { headers: getAuthHeaders() }
    );

    return normalizeShop(response.data?.shop);
  } catch (error) {
    if (error instanceof Error && !error.response) throw error;
    throw new Error(getShopError(error, "Unable to create shop."), {
      cause: error,
    });
  }
}

async function updateShop(shopId, shop) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/shop/${shopId}`,
      toApiShop(shop),
      { headers: getAuthHeaders() }
    );

    return normalizeShop(response.data?.shop);
  } catch (error) {
    if (error instanceof Error && !error.response) throw error;
    throw new Error(getShopError(error, "Unable to update shop."), {
      cause: error,
    });
  }
}

async function deleteShop(shopId) {
  try {
    await axios.delete(`${API_BASE_URL}/shop/${shopId}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    if (error instanceof Error && !error.response) throw error;
    throw new Error(getShopError(error, "Unable to delete shop."), {
      cause: error,
    });
  }
}

const shopManagementService = {
  getShops,
  createShop,
  updateShop,
  deleteShop,
};

export default shopManagementService;
