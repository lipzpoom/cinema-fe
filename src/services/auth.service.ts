import axios from "axios";
import { apiClient } from "./api-client";
// import socketService from "@/services/socket.service";

export class AuthService {
  pathAPI = (import.meta.env?.VITE_APP_CORE_API || "") + "/auth";
  async login(body: any) {
    try {
      const response = await axios.post(`${this.pathAPI}/login`, body);
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      throw error;
    }
  }

  async googleLogin(token: string) {
    try {
      const response = await axios.post(
        `${this.pathAPI}/google/login`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      throw error;
    }
  }

  async profile() {
    try {
      const response = await apiClient.get(`${this.pathAPI}/profile`);
      return response.data;
    } catch (error: any) {
      if (axios.isAxiosError(error) && error.response) {
        return error.response.data;
      }
      throw error;
    }
  }

  async checkUserOTP(body: any) {
    try {
      const response = await axios.post(`${this.pathAPI}/check-user-otp`, body);
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch checkUserOTP");
    }
  }

  decodeToken(): any {
    try {
      const token = localStorage.getItem("token");
      if (!token) return null;

      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map(function (c) {
            return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(""),
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      return null;
    }
  }

  async getUserId() {
    return this.decodeToken()?.user_id;
  }

  async getUserRole() {
    return this.decodeToken()?.user_role;
  }

  async logout() {
    // socketService.disconnect();
    localStorage.removeItem("token");
  }
}
