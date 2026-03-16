import { apiClient } from "./api-client";

export const BookingsService = {
  // Routes requiring login
  createBooking: (data: any) => {
    return apiClient.post("/bookings", data);
  },

  getBookingById: (id: string) => {
    return apiClient.get(`/bookings/${id}`);
  },

  getBookingsByUserId: (userId: string) => {
    return apiClient.get(`/bookings/user/${userId}`);
  },

  payBooking: (id: string) => {
    return apiClient.post(`/bookings/${id}/pay`);
  },

  // Protected Admin Routes
  getAllBookings: () => {
    return apiClient.get("/bookings");
  },

  updateBooking: (id: string, data: any) => {
    return apiClient.put(`/bookings/${id}`, data);
  },

  deleteBooking: (id: string) => {
    return apiClient.delete(`/bookings/${id}`);
  },
};
