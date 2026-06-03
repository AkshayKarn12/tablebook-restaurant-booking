// src/services/api.js
// ============================================================
// Axios instance with interceptors for auth token injection
// ============================================================
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// ─── Request interceptor: attach JWT ─────────────────────────
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor: handle 401 ─────────────────────────
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Redirect to login if needed
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════════════════════════
// AUTH APIs
// ═══════════════════════════════════════════════════════════════
export const authAPI = {
  register: (data) => API.post("/auth/register", data),
  login: (data) => API.post("/auth/login", data),
  googleAuth: (data) => API.post("/auth/google", data),
  getMe: () => API.get("/auth/me"),
  updatePassword: (data) => API.put("/auth/updatepassword", data),
};

// ═══════════════════════════════════════════════════════════════
// RESTAURANT APIs
// ═══════════════════════════════════════════════════════════════
export const restaurantAPI = {
  getAll: (params) => API.get("/restaurants", { params }),
  getFeatured: () => API.get("/restaurants/featured"),
  getById: (id) => API.get(`/restaurants/${id}`),
  getMyRestaurants: () => API.get("/restaurants/owner/my"),
  checkAvailability: (id, params) => API.get(`/restaurants/${id}/availability`, { params }),
  create: (data) => API.post("/restaurants", data, { headers: { "Content-Type": "multipart/form-data" } }),
  update: (id, data) => API.put(`/restaurants/${id}`, data, { headers: { "Content-Type": "multipart/form-data" } }),
  delete: (id) => API.delete(`/restaurants/${id}`),
  addReview: (id, data) => API.post(`/restaurants/${id}/reviews`, data),
};

// ═══════════════════════════════════════════════════════════════
// BOOKING APIs
// ═══════════════════════════════════════════════════════════════
export const bookingAPI = {
  create: (data) => API.post("/bookings", data),
  getMyBookings: (params) => API.get("/bookings/my", { params }),
  getById: (id) => API.get(`/bookings/${id}`),
  getRestaurantBookings: (restaurantId, params) =>
    API.get(`/bookings/restaurant/${restaurantId}`, { params }),
  getStats: (restaurantId) =>
    API.get("/bookings/stats", { params: { restaurantId } }),
  updateStatus: (id, data) => API.put(`/bookings/${id}/status`, data),
  cancel: (id, data) => API.put(`/bookings/${id}/cancel`, data),
};

// ═══════════════════════════════════════════════════════════════
// USER APIs
// ═══════════════════════════════════════════════════════════════
export const userAPI = {
  getProfile: () => API.get("/users/profile"),
  updateProfile: (data) =>
    API.put("/users/profile", data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  getFavorites: () => API.get("/users/favorites"),
  toggleFavorite: (restaurantId) =>
    API.post(`/users/favorites/${restaurantId}`),
};

// ═══════════════════════════════════════════════════════════════
// ADMIN APIs
// ═══════════════════════════════════════════════════════════════
export const adminAPI = {
  getStats: () => API.get("/admin/stats"),
  getUsers: (params) => API.get("/admin/users", { params }),
  updateUser: (id, data) => API.put(`/admin/users/${id}`, data),
  deleteUser: (id) => API.delete(`/admin/users/${id}`),
  getRestaurants: (params) => API.get("/admin/restaurants", { params }),
  approveRestaurant: (id, data) =>
    API.put(`/admin/restaurants/${id}/approve`, data),
  deleteRestaurant: (id) => API.delete(`/admin/restaurants/${id}`),
};

// ═══════════════════════════════════════════════════════════════
// MENU APIs
// ═══════════════════════════════════════════════════════════════
export const menuAPI = {
  getMenu: (restaurantId) => API.get(`/menu/${restaurantId}`),
  addItem: (restaurantId, data) =>
    API.post(`/menu/${restaurantId}`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteItem: (restaurantId, itemId) =>
    API.delete(`/menu/${restaurantId}/items/${itemId}`),
};

export default API;
