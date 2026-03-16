import { apiClient } from "./api-client";

export const UsersService = {
  // Routes requiring login (assuming users fetch themselves)
  getUserById: (id: string) => {
    return apiClient.get(`/users/${id}`);
  },

  // Protected Admin Routes
  getAllUsers: () => {
    return apiClient.get("/users");
  },

  createUser: (data: any) => {
    return apiClient.post("/users", data);
  },

  updateUser: (id: string, data: any) => {
    return apiClient.put(`/users/${id}`, data);
  },

  deleteUser: (id: string) => {
    return apiClient.delete(`/users/${id}`);
  },
};
