import axios from "axios";

const config = {
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
  timeout: 10000,
};

export const api = axios.create(config);
export const authApi = axios.create({ ...config, timeout: 5000 });
// Public references: no session interceptors, so no refresh and no logout rejection
export const publicApi = axios.create({ ...config, withCredentials: false });
export { PENDING_LOGOUT_KEY } from "./session.ts";
