import axios, {
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from "axios";

export const publicApiClient = axios.create({
  baseURL: import.meta.env?.VITE_APP_CORE_API,
});

export const apiClient = axios.create({
  baseURL: import.meta.env?.VITE_APP_CORE_API,
});

apiClient.interceptors.request.use(
  function (config: InternalAxiosRequestConfig) {
    // ดึง token จาก local storage หรือ state management
    const token = localStorage.getItem("token"); // หรือใช้จาก Vuex, Pinia, หรือที่อื่น ๆ

    // ถ้ามี token ให้แนบไปกับ request header
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  function (error: AxiosError) {
    // ทำงานเมื่อเกิด error ก่อนที่ request จะถูกส่ง
    return Promise.reject(error);
  },
);

apiClient.interceptors.response.use(
  function (response: AxiosResponse) {
    // การทำงานเมื่อได้รับ response สำเร็จ
    return response;
  },
  function (error: AxiosError) {
    // การทำงานเมื่อ response มี error
    if (error.response) {
      // ตัวอย่างการจัดการ error เช่น ถ้า status code เป็น 401
      const data = error.response.data as any;
      if (data?.status_code === 401 || error.response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  },
);
