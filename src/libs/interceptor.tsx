import axios from "axios";
import { jwtDecode } from "jwt-decode";

const axiosInstance = axios.create({
  baseURL: "https://project-be-eight.vercel.app",
});

const isTokenExpired = (token: string) => {
  const decoded = jwtDecode(token);
  if (!decoded.exp) {
    return true;
  }
  const currentTime = Date.now() / 1000;
  return decoded.exp < currentTime;
};

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token && isTokenExpired(token)) {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  config.headers["Accept-Language"] = "Eng";
  config.headers.Accept = "application/json";
  config.headers["Content-Type"] = "application/json";

  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    return Promise.reject(error);
  }
);

export default axiosInstance;
