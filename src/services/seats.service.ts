import { apiClient, publicApiClient } from "./api-client";

export const SeatsService = {
  // Public Routes
  getAllSeats: (params?: any) => {
    return publicApiClient.get("/seats", { params });
  },

  getSeatById: (id: string) => {
    return publicApiClient.get(`/seats/${id}`);
  },

  // Protected Admin Routes
  createSeat: (data: any) => {
    return apiClient.post("/seats", data);
  },

  updateSeat: (id: string, data: any) => {
    return apiClient.put(`/seats/${id}`, data);
  },

  deleteSeat: (id: string) => {
    return apiClient.delete(`/seats/${id}`);
  },
};
