import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 30000,
  timeoutErrorMessage: "Request timed out. Please check your connection and try again.",
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const originalRequest = error.config;
    const errorStatus = error.response?.status;
    const errorMessage = error.response?.data?.message || "";
    
    if (errorStatus === 401) {
      console.warn("401 Unauthorized - Response:", {
        url: error.config?.url,
        method: error.config?.method,
        status: errorStatus,
        data: error.response?.data
      });
      
      // Don't redirect to login for payment-related errors
      const isPaymentError = errorMessage.includes("payment") || 
                            errorMessage.includes("Razorpay") ||
                            errorMessage.includes("Payment");
      
      const isBookingApi = error.config?.url?.includes("/bookings");
      
      if (isPaymentError && isBookingApi) {
        console.warn("Payment error - not redirecting to login");
        return Promise.reject(error);
      }
    }
    
    if (errorStatus === 401 && !originalRequest._retry) {
      console.warn("401 Unauthorized - clearing auth state");
      if (error.config.url?.includes("/customer/")) {
        localStorage.removeItem("eventmitra-auth");
        window.location.href = "/login";
      } else if (error.config.url?.includes("/provider/")) {
        localStorage.removeItem("eventmitra-auth");
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

export const authApi = {
  login: (payload) => api.post("/auth/login", payload),
  register: (payload) => api.post("/auth/register", payload),
  getProfile: () => api.get("/auth/me"),
  updateProfile: (payload) => api.put("/auth/me", payload),
  // verifyOtp: (payload) => api.post("/auth/verify-otp", payload),
  // sendOtp: (payload) => api.post("/auth/send-otp", payload),
};

export const adminApi = {
  getDashboard: () => api.get("/admin/dashboard"),
  getServiceCategories: () => api.get("/admin/services/categories"),
  createServiceCategory: (payload) => api.post("/admin/services/categories", payload),
  getServices: () => api.get("/admin/services"),
  createService: (payload) => api.post("/admin/services", payload),
  updateService: (id, payload) => api.put(`/admin/services/${id}`, payload),
  deleteService: (id) => api.delete(`/admin/services/${id}`),
  getProviders: () => api.get("/admin/providers"),
  updateProviderStatus: (id, status) =>
    api.patch(`/admin/providers/${id}/status`, { status }),
  getCustomers: () => api.get("/admin/customers"),
  getCustomer: (id) => api.get(`/admin/customers/${id}`),
  getBookings: (params) => api.get("/admin/bookings", { params }),
  getCancelledBookings: (params) => api.get("/admin/bookings/cancelled", { params }),
  assignProvider: (id, providerId) =>
    api.patch(`/admin/bookings/${id}/provider`, { providerId }),
  cancelBooking: (id, payload) => api.patch(`/admin/bookings/${id}/cancel`, payload),
  releaseProviderPayment: (bookingId) => api.post(`/admin/bookings/${bookingId}/release-payment`),
  getPayments: () => api.get("/admin/payments"),
  releasePayout: (id, payload) =>
    api.patch(`/admin/payments/${id}/release`, payload),
  getGallery: () => api.get("/admin/gallery"),
  addGalleryImage: (payload) => api.post("/admin/gallery", payload),
  deleteGalleryImage: (id) => api.delete(`/admin/gallery/${id}`),
  getContacts: () => api.get("/admin/contacts"),
};

export const providerApi = {
  getDashboard: () => api.get("/provider/dashboard"),
  getServiceCategories: () => api.get("/provider/service-categories"),
  createServiceCategory: (payload) => api.post("/provider/service-categories", payload),
  getServices: () => api.get("/provider/services"),
  createService: (payload) => api.post("/provider/services", payload),
  updateService: (id, payload) => api.put(`/provider/services/${id}`, payload),
  deleteService: (id) => api.delete(`/provider/services/${id}`),
  getProfile: () => api.get("/provider/profile"),
  updateProfile: (payload) => api.put("/provider/profile", payload),
  uploadPortfolio: (formData) =>
    api.post("/provider/profile/portfolio", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  uploadImage: (formData) =>
    api.post("/provider/services/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  uploadMultipleImages: (formData) =>
    api.post("/provider/services/upload-images", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  uploadVideos: (formData) =>
    api.post("/provider/services/upload-videos", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),
  getBookings: () => api.get("/provider/bookings"),
  respondToBooking: (id, action) => api.patch(`/provider/bookings/${id}/respond`, { action }),
  startJob: (id) => api.patch(`/provider/bookings/${id}/start`),
  verifyStartOtp: (id, otp) => api.patch(`/provider/bookings/${id}/verify-start-otp`, { otp }),
  completeJob: (id) => api.patch(`/provider/bookings/${id}/complete`),
  verifyCompletionOtp: (id, payload) => api.patch(`/provider/bookings/${id}/verify-completion-otp`, payload),
  regenerateCompletionOtp: (id) => api.patch(`/provider/bookings/${id}/regenerate-completion-otp`),
  getRemainingPayment: (bookingId) => api.get(`/provider/bookings/${bookingId}/remaining-payment`),
  verifyRemainingPayment: (bookingId, payload) =>
    api.post(`/provider/bookings/${bookingId}/payments/remaining/verify`, payload),
  getEarnings: () => api.get("/provider/earnings"),
};

export const customerApi = {
  getDashboard: () => api.get("/customer/dashboard"),
  getServices: () => api.get("/customer/services"),
  createBooking: (payload) => api.post("/customer/bookings", payload),
  createCartBooking: (payload) => api.post("/customer/bookings", payload),
  getBookings: () => api.get("/customer/bookings"),
  verifyAdvancePayment: (bookingId, payload) =>
    api.post(`/customer/bookings/${bookingId}/payments/advance/verify`, payload),
  getRemainingPayment: (bookingId) =>
    api.get(`/customer/bookings/${bookingId}/payments/remaining`),
  verifyRemainingPayment: (bookingId, payload) =>
    api.post(`/customer/bookings/${bookingId}/payments/remaining/verify`, payload),
  verifyOtp: (bookingId, payload) => api.patch(`/customer/bookings/${bookingId}/verify-otp`, payload),
  getAvailableSlots: (providerId, eventDate, duration, serviceIds) => api.get("/customer/available-slots", { params: { providerId, eventDate, duration, serviceIds: serviceIds?.join(',') } }),
  cancelBooking: (bookingId, payload) => api.patch(`/customer/bookings/${bookingId}/cancel`, payload),
};

export const publicApi = {
  getServiceCategories: () => api.get("/public/service-categories"),
  getServices: (params) => api.get("/public/services", { params }),
  getService: (id) => api.get(`/public/services/${id}`),
  getProvidersByCategory: (categoryId) => api.get(`/public/providers/by-category/${categoryId}`),
  getProviderServices: (providerId) => api.get(`/public/provider-services/${providerId}`),
  getGallery: (params) => api.get("/public/gallery", { params }),
  getTestimonials: () => api.get("/public/testimonials"),
  getStats: () => api.get("/public/stats"),
  submitContact: (data) => api.post("/contact", data),
};
