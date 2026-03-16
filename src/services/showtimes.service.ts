import { apiClient, publicApiClient } from "./api-client";

export const ShowtimesService = {
  // Public Routes
  getNowShowing: (date?: string) => {
    const query = date ? `?date=${date}` : "";
    return publicApiClient.get(`/showtimes/now-showing${query}`);
  },

  getAllShowtimes: () => {
    return publicApiClient.get("/showtimes");
  },

  getShowtimeById: (id: string) => {
    return publicApiClient.get(`/showtimes/${id}`);
  },

  // Protected Admin Routes
  createShowtime: (data: any) => {
    return apiClient.post("/showtimes", data);
  },

  updateShowtime: (id: string, data: any) => {
    return apiClient.put(`/showtimes/${id}`, data);
  },

  deleteShowtime: (id: string) => {
    return apiClient.delete(`/showtimes/${id}`);
  },
};
