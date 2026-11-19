import axios, { type AxiosInstance } from "axios";
import toast from "react-hot-toast";

const config = {
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  withCredentials: true,
  timeout: 10000,
};

export const api = axios.create(config);
export const authApi = axios.create({ ...config, timeout: 5000 });
// Public references: no session interceptors, so no refresh and no logout rejection
export const publicApi = axios.create({ ...config, withCredentials: false });
export { PENDING_LOGOUT_KEY } from "./session.ts";

export const RATE_LIMIT_MESSAGE =
  "Too many attempts. Please wait a bit before trying again.";

// One id: parallel requests hitting the limit show a single toast
const RATE_LIMIT_TOAST_ID = "rate-limit";

// [BE-12]: the backend answers 429 when an IP exceeds its rate limit.
// The error is still rethrown so callers stop; it never triggers a refresh (only 401 does)
const notifyRateLimit = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 429) {
    toast.error(RATE_LIMIT_MESSAGE, {
      id: RATE_LIMIT_TOAST_ID,
      style: {
        background: "var(--color-main)",
        color: "var(--color-white)",
      },
      iconTheme: {
        primary: "var(--color-error)",
        secondary: "var(--color-white)",
      },
    });
  }
  return Promise.reject(error);
};

for (const instance of [api, authApi] satisfies AxiosInstance[]) {
  instance.interceptors.response.use(undefined, notifyRateLimit);
}
