import axios from "axios";

export const PENDING_LOGOUT_KEY = "foodies_pending_logout";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

/**
 * Перевіряє, чи був незавершений офлайн-вихід під час попередньої сесії.
 * Викликається перед перевіркою поточного користувача при старті застосунку ([FE-02]).
 */
export const syncPendingLogout = async (): Promise<boolean> => {
  if (localStorage.getItem(PENDING_LOGOUT_KEY) !== "true") {
    return false;
  }

  try {
    await api.post("/auth/logout");
    localStorage.removeItem(PENDING_LOGOUT_KEY);
  } catch {
    // Якщо мережі досі немає, залишаємо прапорець у localStorage і не виконуємо автологін
  }

  return true;
};
