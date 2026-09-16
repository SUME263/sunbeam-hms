import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
});

api.interceptors.request.use((config) => {
  const staffToken = localStorage.getItem("access_token");
  const customerToken = localStorage.getItem("customer_access_token");

  const isCustomerRequest =
    config.url?.includes("/customer/") ||
    config.url?.includes("/customer");

  const token = isCustomerRequest ? customerToken : staffToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || "";

    const isLoginRequest =
      url.includes("/auth/login") ||
      url.includes("/auth/customer/login");

    const isCustomerRequest =
      url.includes("/customer/") ||
      url.includes("/customer");

    if (error.response?.status === 401 && !isLoginRequest) {
      if (isCustomerRequest) {
        localStorage.removeItem("customer_access_token");
        localStorage.removeItem("customer");
        window.location.reload();
      } else {
        localStorage.removeItem("access_token");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// staff login
export const login = (email, password) =>
  api.post("/auth/login", { email, password });

// customer login
export const customerLogin = (email, password) =>
  api.post("/auth/customer/login", { email, password });

// customer registration
export const customerRegister = (
  full_name,
  email,
  phone,
  password
) =>
  api.post("/auth/customer/register", {
    full_name,
    email,
    phone,
    password,
  });

export const getCustomerRooms = () =>
  api.get("/rooms/customer/available");

export const checkCustomerAvailability = (
  check_in_date,
  check_out_date,
  room_type_id
) =>
  api.post("/reservations/customer/check-availability", {
    check_in_date,
    check_out_date,
    room_type_id,
  });

export const createCustomerReservation = (payload) =>
  api.post("/reservations/customer", payload);

export const listCustomerReservations = () =>
  api.get("/reservations/customer/my");

export const checkAvailability = (check_in_date, check_out_date, room_type_id) =>
  api.post("/reservations/check-availability", { check_in_date, check_out_date, room_type_id });

export const createReservation = (payload) => api.post("/reservations", payload);

export const listReservations = () => api.get("/reservations");
export const checkIn = (id) => api.post(`/reservations/${id}/check-in`);
export const checkOut = (id) => api.post(`/reservations/${id}/check-out`);
export const cancelReservation = (id) => api.post(`/reservations/${id}/cancel`);

export const getRevenueReport = (start_date, end_date) =>
  api.get("/reports/revenue", { params: { start_date, end_date } });

// customer related functions
export const createCustomerPayment = (payload) =>
  api.post("/payments/customer", payload);

export const listCustomerPayments = () =>
  api.get("/payments/customer/my");

// occupancy report
export const getOccupancyReport = () => api.get("/reports/occupancy");

// guest related API functions
export const listGuests = () => api.get("/guests");

export const getGuest = (id) => api.get(`/guests/${id}`);

export const createGuest = (payload) => api.post("/guests", payload);

export const updateGuest = (id, payload) =>
  api.put(`/guests/${id}`, payload);

// rooms functions ... will need to double check this whole file later
export const listRooms = () => api.get("/rooms");

export const getRoom = (id) =>
  api.get(`/rooms/${id}`);

export const createRoom = (payload) =>
  api.post("/rooms", payload);

export const updateRoom = (id, payload) =>
  api.put(`/rooms/${id}`, payload);

export const updateRoomStatus = (id, status) =>
  api.patch(`/rooms/${id}/status`, null, {
    params: { status }
  });

// staff management 
export const listStaff = () =>
  api.get("/staff");

export const getStaff = (id) =>
  api.get(`/staff/${id}`);

export const createStaff = (payload) =>
  api.post("/staff", payload);

export const updateStaffStatus = (id, is_active) =>
  api.patch(`/staff/${id}/status`, {
    is_active
  });

// payments 
export const listPayments = () => api.get("/payments");

export const createPayment = (payload) =>
  api.post("/payments", payload);

export const markPaymentPaid = (id) =>
  api.post(`/payments/${id}/mark-paid`);

export const refundPayment = (id) =>
  api.post(`/payments/${id}/refund`);

export default api;