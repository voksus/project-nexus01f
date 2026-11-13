import axios from "axios";

const config = {
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  timeout: 10000,
};

export const api = axios.create(config);
export const authApi = axios.create({ ...config, timeout: 5000 });
export { PENDING_LOGOUT_KEY } from "./session.ts";
