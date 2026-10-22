import axios from "axios";
import { saveCart } from "./cartService";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:7000/api/auth";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Please log in before placing an order.");
  }

  return { Authorization: `Bearer ${token}` };
}

export async function placeOrder(address, items) {
  const headers = getAuthHeaders();
  await saveCart(items);

  const response = await axios.post(
    `${API_BASE_URL}/order`,
    {
      name: address.name.trim(),
      phone: address.phone.trim(),
      address: address.address.trim(),
      city: address.city.trim(),
      pincode: address.pincode.trim(),
    },
    { headers }
  );

  return response.data?.order;
}
