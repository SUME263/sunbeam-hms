import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginRequest = error.config?.url?.includes("/auth/login");
    if (error.response && error.response.status === 401 && !isLoginRequest) {
      localStorage.removeItem("access_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const login = (email, password) =>
  api.post("/auth/login", { email, password });

export const checkAvailability = (check_in_date, check_out_date, room_type_id) =>
  api.post("/reservations/check-availability", { check_in_date, check_out_date, room_type_id });

export const createReservation = (payload) => api.post("/reservations", payload);

export const listReservations = () => api.get("/reservations");

export const checkIn = (id) => api.post(`/reservations/${id}/check-in`);
export const checkOut = (id) => api.post(`/reservations/${id}/check-out`);
export const cancelReservation = (id) => api.post(`/reservations/${id}/cancel`);

export const getRevenueReport = (start_date, end_date) =>
  api.get("/reports/revenue", { params: { start_date, end_date } });

export const getOccupancyReport = () => api.get("/reports/occupancy");

// guest related API functions
export const listGuests = () => api.get("/guests");

export const getGuest = (id) => api.get(`/guests/${id}`);

export const createGuest = (payload) => api.post("/guests", payload);

export const updateGuest = (id, payload) =>
  api.put(`/guests/${id}`, payload);

export default api;
