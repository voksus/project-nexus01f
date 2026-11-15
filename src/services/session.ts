import axios, {
  type AxiosInstance,
  CanceledError,
  type InternalAxiosRequestConfig,
} from "axios";
import type {
  AuthUser,
  LoginCredentials,
  RegisterCredentials,
} from "../types/auth.ts";

export const PENDING_LOGOUT_KEY = "foodies_pending_logout";

type SessionRequest = InternalAxiosRequestConfig & {
  sessionEpoch?: number;
  refreshGeneration?: number;
  sessionRetried?: boolean;
};

interface SessionOptions {
  api: AxiosInstance;
  authApi: AxiosInstance;
  storage: Pick<Storage, "getItem" | "setItem" | "removeItem">;
  isOnline: () => boolean;
  withLock?: <T>(task: () => Promise<T>) => Promise<T>;
  onUser: (user: AuthUser) => void;
  onReset: () => void;
  onNavigateHome: () => void;
}

const readUser = (data: unknown): AuthUser => {
  const value =
    typeof data === "object" && data !== null && "user" in data
      ? data.user
      : data;
  if (
    typeof value !== "object" ||
    value === null ||
    !("id" in value) ||
    typeof value.id !== "string" ||
    !("name" in value) ||
    typeof value.name !== "string" ||
    !("email" in value) ||
    typeof value.email !== "string"
  ) {
    throw new Error("Invalid user response");
  }
  return {
    id: value.id,
    name: value.name,
    email: value.email,
    avatar:
      "avatar" in value && typeof value.avatar === "string"
        ? value.avatar
        : null,
  };
};

const isAuthEndpoint = (url = "") =>
  /\/auth\/(login|register|refresh|logout)\/?$/.test(
    new URL(url, "https://foodies.local").pathname,
  );

export function createAuthSession(options: SessionOptions) {
  const { api, authApi, storage } = options;
  let epoch = 0;
  let signedOut = false;
  let currentUserId: string | null = null;
  let fallbackPending = false;
  let refreshGeneration = 0;
  let refreshPromise: Promise<void> | undefined;
  let refreshController: AbortController | undefined;
  let initialization: Promise<void> | undefined;
  let authenticationEpoch: number | undefined;
  let authenticationStartedWithPendingLogout = false;
  let retryInitialization = false;
  let queue: Promise<unknown> = Promise.resolve();

  const pendingLogout = () => {
    try {
      return storage.getItem(PENDING_LOGOUT_KEY) === "true" || fallbackPending;
    } catch {
      return fallbackPending;
    }
  };
  const markPending = () => {
    try {
      storage.setItem(PENDING_LOGOUT_KEY, "true");
      fallbackPending = false;
    } catch {
      fallbackPending = true;
    }
  };
  const clearPending = () => {
    fallbackPending = false;
    try {
      storage.removeItem(PENDING_LOGOUT_KEY);
    } catch {
      /* Storage access may be blocked by browser policy. */
    }
  };
  const changed = () => new CanceledError("Session changed");
  const assertEpoch = (expected: number) => {
    if (expected !== epoch) throw changed();
  };
  const invalidate = () => {
    epoch += 1;
    signedOut = true;
    retryInitialization = false;
    currentUserId = null;
    refreshController?.abort();
    options.onReset();
    return epoch;
  };
  const cookieTask = <T>(task: () => Promise<T>): Promise<T> => {
    const next = queue.then(() =>
      options.withLock ? options.withLock(task) : task(),
    );
    queue = next.catch(() => undefined);
    return next;
  };

  const performPendingLogout = async (expected: number): Promise<boolean> => {
    assertEpoch(expected);
    if (!pendingLogout()) return true;
    try {
      await authApi.post("/auth/logout");
      assertEpoch(expected);
      clearPending();
      return true;
    } catch {
      return false;
    }
  };

  const syncPendingLogout = async (): Promise<boolean> => {
    if (!pendingLogout() || !options.isOnline()) return false;
    const expected = epoch;
    return cookieTask(async () => {
      if (expected !== epoch || !pendingLogout()) return false;
      return performPendingLogout(expected);
    }).catch(() => false);
  };

  const refresh = (): Promise<void> => {
    if (refreshPromise) return refreshPromise;
    const expected = epoch;
    const promise = cookieTask(async () => {
      assertEpoch(expected);
      if (signedOut || pendingLogout()) throw changed();
      refreshController = new AbortController();
      try {
        await authApi.post("/auth/refresh", undefined, {
          signal: refreshController.signal,
        });
        assertEpoch(expected);
        if (signedOut || pendingLogout()) throw changed();
        refreshGeneration += 1;
      } catch (error) {
        if (
          expected === epoch &&
          axios.isAxiosError(error) &&
          (error.response?.status === 401 || error.response?.status === 403)
        ) {
          invalidate();
          options.onNavigateHome();
        }
        throw error;
      } finally {
        refreshController = undefined;
      }
    });
    refreshPromise = promise;
    void promise
      .finally(() => {
        if (refreshPromise === promise) refreshPromise = undefined;
      })
      .catch(() => undefined);
    return promise;
  };

  const requestInterceptor = api.interceptors.request.use(
    (config: SessionRequest) => {
      if (config.sessionEpoch !== undefined && config.sessionEpoch !== epoch)
        throw changed();
      config.sessionEpoch = epoch;
      config.refreshGeneration = refreshGeneration;
      return config;
    },
    (error: unknown) => {
      throw error;
    },
    { synchronous: true },
  );
  const responseInterceptor = api.interceptors.response.use(
    (response) => {
      const config = response.config as SessionRequest;
      assertEpoch(config.sessionEpoch ?? epoch);
      return response;
    },
    async (error: unknown) => {
      if (!axios.isAxiosError(error) || !error.config) throw error;
      const config = error.config as SessionRequest;
      assertEpoch(config.sessionEpoch ?? epoch);
      if (
        error.response?.status !== 401 ||
        isAuthEndpoint(config.url) ||
        signedOut ||
        pendingLogout()
      )
        throw error;
      if (config.sessionRetried) {
        invalidate();
        options.onNavigateHome();
        throw error;
      }
      config.sessionRetried = true;
      const expected = epoch;
      if ((config.refreshGeneration ?? 0) === refreshGeneration)
        await refresh();
      assertEpoch(expected);
      if (signedOut || pendingLogout()) throw changed();
      return api.request(config);
    },
  );

  const authenticate = async (
    path: "/auth/login" | "/auth/register",
    credentials: LoginCredentials | RegisterCredentials,
  ): Promise<AuthUser> => {
    const expected = invalidate();
    authenticationEpoch = expected;
    authenticationStartedWithPendingLogout = pendingLogout();
    return cookieTask(async () => {
      assertEpoch(expected);
      if (pendingLogout()) await performPendingLogout(expected);
      assertEpoch(expected);
      const response = await authApi.post<unknown>(path, {
        ...credentials,
        email: credentials.email.trim().toLowerCase(),
      });
      assertEpoch(expected);
      const user = readUser(response.data);
      clearPending();
      signedOut = false;
      currentUserId = user.id;
      options.onUser(user);
      return user;
    }).finally(() => {
      if (authenticationEpoch === expected) authenticationEpoch = undefined;
    });
  };

  const initialize = (): Promise<void> => {
    if (initialization) return initialization;
    initialization = (async () => {
      if (pendingLogout()) {
        invalidate();
        await syncPendingLogout();
        return;
      }
      const expected = epoch;
      try {
        const response = await api.get<unknown>("/users/current");
        assertEpoch(expected);
        const user = readUser(response.data);
        signedOut = false;
        currentUserId = user.id;
        options.onUser(user);
      } catch (error) {
        if (expected === epoch) {
          invalidate();
          retryInitialization =
            axios.isAxiosError(error) &&
            (!error.response || error.response.status >= 500);
        }
      }
    })();
    return initialization;
  };

  return {
    pendingLogout,
    syncPendingLogout,
    login: (credentials: LoginCredentials) =>
      authenticate("/auth/login", credentials),
    register: (credentials: RegisterCredentials) =>
      authenticate("/auth/register", credentials),
    initialize,
    handleOnline: async (): Promise<void> => {
      if (pendingLogout()) {
        await syncPendingLogout();
        return;
      }
      if (!retryInitialization || !options.isOnline()) return;
      retryInitialization = false;
      signedOut = false;
      initialization = undefined;
      await initialize();
    },
    logout: async (): Promise<void> => {
      const expected = invalidate();
      markPending();
      options.onNavigateHome();
      try {
        await cookieTask(async () => {
          if (expected === epoch && pendingLogout())
            await performPendingLogout(expected);
        }).catch(() => undefined);
      } finally {
        if (expected === epoch) {
          options.onReset();
          options.onNavigateHome();
        }
      }
    },
    handleStorageEvent: async (
      event: Pick<StorageEvent, "key" | "newValue">,
    ): Promise<void> => {
      if (event.key !== PENDING_LOGOUT_KEY || event.newValue !== "true") return;
      if (
        authenticationEpoch === epoch &&
        authenticationStartedWithPendingLogout
      ) {
        const expected = epoch;
        await queue;
        if (expected !== epoch || !pendingLogout()) return;
      }
      if (pendingLogout()) {
        invalidate();
        options.onNavigateHome();
        await syncPendingLogout();
        return;
      }
      const expected = epoch;
      await cookieTask(async () => {
        if (expected !== epoch || signedOut) return;
        try {
          const response = await authApi.get<unknown>("/users/current");
          assertEpoch(expected);
          if (readUser(response.data).id === currentUserId) return;
        } catch {
          if (expected !== epoch) return;
        }
        invalidate();
        options.onNavigateHome();
      }).catch(() => {
        if (expected === epoch) {
          invalidate();
          options.onNavigateHome();
        }
      });
    },
    dispose: () => {
      refreshController?.abort();
      api.interceptors.request.eject(requestInterceptor);
      api.interceptors.response.eject(responseInterceptor);
    },
  };
}

export type AuthSession = ReturnType<typeof createAuthSession>;
