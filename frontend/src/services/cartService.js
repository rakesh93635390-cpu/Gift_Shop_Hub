import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:7000/api/auth";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Please log in to access your cart.");
  }

  return { Authorization: `Bearer ${token}` };
}

function normalizeCart(cart) {
  return (cart?.products || []).map((item) => {
    const product =
      typeof item.productId === "object" && item.productId !== null
        ? item.productId
        : null;

    return {
      productId: product?._id || item.productId,
      productName: product?.productName || "Lovely Gift",
      productPrice: Number(product?.productPrice) || 0,
      productImage: product?.ProductImage || product?.productImage || "",
      productCategory: product?.productCategory || "Gift",
      shopName:
        typeof product?.productShop === "object"
          ? product.productShop?.shopName || product.productShop?.name || "Gift Shop"
          : "Gift Shop",
      quantity: Number(item.quantity) || 1,
      stock: Number.isFinite(Number(product?.productStock))
        ? Number(product.productStock)
        : null,
    };
  });
}

export async function getCart() {
  const headers = getAuthHeaders();

  try {
    const response = await axios.get(`${API_BASE_URL}/carts`, { headers });
    return normalizeCart(response.data?.cart);
  } catch (error) {
    if (error.response?.status === 404) return [];
    throw error;
  }
}

export async function saveCart(cart) {
  const headers = getAuthHeaders();
  const response = await axios
    .get(`${API_BASE_URL}/carts`, { headers })
    .catch((error) => {
      if (error.response?.status === 404) return null;
      throw error;
    });
  const serverItems = response?.data?.cart?.products || [];
  const desiredItems = new Map(
    cart.map((item) => [String(item.productId), Number(item.quantity)])
  );

  for (const item of serverItems) {
    const productId = String(item.productId?._id || item.productId);
    const quantity = desiredItems.get(productId);

    if (quantity === undefined) {
      await axios.delete(`${API_BASE_URL}/cart/${productId}`, { headers });
    } else {
      if (Number(item.quantity) !== quantity) {
        await axios.put(
          `${API_BASE_URL}/cart/${productId}`,
          { quantity },
          { headers }
        );
      }
      desiredItems.delete(productId);
    }
  }

  for (const [productId, quantity] of desiredItems) {
    await axios.post(
      `${API_BASE_URL}/cart`,
      { productId, quantity },
      { headers }
    );
  }

  return getCart();
}

export async function addProductToCart(product) {
  const productId = product?._id || product?.id;
  if (!productId) {
    throw new Error("This product cannot be added to the cart.");
  }

  const availableStock = Number(product.productStock);
  if (Number.isFinite(availableStock) && availableStock <= 0) {
    throw new Error("This gift is currently out of stock.");
  }

  const headers = getAuthHeaders();
  const cart = await getCart();
  const existingProduct = cart.find(
    (item) => String(item.productId) === String(productId)
  );
  const currentQuantity = existingProduct?.quantity || 0;

  if (
    existingProduct &&
    Number.isFinite(availableStock) &&
    currentQuantity >= availableStock
  ) {
    throw new Error("You have added all available stock to your cart.");
  }

  await axios.post(
    `${API_BASE_URL}/cart`,
    { productId, quantity: 1 },
    { headers }
  );
}
