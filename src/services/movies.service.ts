import { apiClient, publicApiClient } from "./api-client";

export const MoviesService = {
  // Public Routes
  getAllMovies: () => {
    return publicApiClient.get("/movies");
  },

  getMovieById: (id: string) => {
    return publicApiClient.get(`/movies/${id}`);
  },

  getShowtimesByMovieId: (id: string) => {
    return publicApiClient.get(`/movies/${id}/showtimes`);
  },

  // Protected Admin Routes
  createMovie: (data: any) => {
    return apiClient.post("/movies", data);
  },

  updateMovie: (id: string, data: any) => {
    return apiClient.put(`/movies/${id}`, data);
  },

  deleteMovie: (id: string) => {
    return apiClient.delete(`/movies/${id}`);
  },
};
