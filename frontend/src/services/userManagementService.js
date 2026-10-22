import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:7000/api/auth";

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Please log in to manage users.");
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

function normalizeUser(user) {
  if (!user || typeof user !== "object") {
    throw new Error("Unexpected response while retrieving user information.");
  }

  return {
    ...user,
    _id: String(user._id || user.id || ""),
    name: user.name || "",
    email: user.email || "",
    role:
      String(user.role || "user").toLowerCase() === "admin"
        ? "Admin"
        : "User",
    phone: user.phone || "",
    status:
      String(user.status || "active").toLowerCase() === "inactive"
        ? "Inactive"
        : "Active",
    joined: user.createdAt || user.joined || "",
  };
}

async function getUsers() {
  try {
    const response = await axios.get(`${API_BASE_URL}/users`, {
      headers: getAuthHeaders(),
    });
    if (!Array.isArray(response.data?.users)) {
      throw new Error("Unexpected response while retrieving users.");
    }
    return response.data.users.map(normalizeUser);
  } catch (error) {
    if (error instanceof Error && !error.response) throw error;
    throw new Error(getRequestError(error, "Unable to load users."), {
      cause: error,
    });
  }
}

async function createUser(userData) {
  try {
    await axios.post(`${API_BASE_URL}/register`, userData, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    if (error instanceof Error && !error.response) throw error;
    throw new Error(getRequestError(error, "Unable to create user."), {
      cause: error,
    });
  }
}

async function updateUser(userId, userData) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/user/${userId}`,
      userData,
      { headers: getAuthHeaders() }
    );
    if (!response.data?.user) {
      throw new Error("Unexpected response while updating user.");
    }
    return normalizeUser(response.data.user);
  } catch (error) {
    if (error instanceof Error && !error.response) throw error;
    throw new Error(getRequestError(error, "Unable to update user."), {
      cause: error,
    });
  }
}

async function deleteUser(userId) {
  try {
    await axios.delete(`${API_BASE_URL}/user/${userId}`, {
      headers: getAuthHeaders(),
    });
  } catch (error) {
    if (error instanceof Error && !error.response) throw error;
    throw new Error(getRequestError(error, "Unable to delete user."), {
      cause: error,
    });
  }
}

const userManagementService = {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
};

export default userManagementService;
