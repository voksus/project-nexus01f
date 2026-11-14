import axios, {
  AxiosError,
  AxiosHeaders,
  type InternalAxiosRequestConfig,
} from "axios";
import { afterEach, describe, expect, it, vi } from "vitest";
import { sessionReceived } from "../redux/auth/authSlice.ts";
import { rootReducer } from "../redux/rootReducer.ts";
import { sessionCleared } from "../redux/sessionActions.ts";
import type { AuthUser } from "../types/auth.ts";
import { api as configuredApi } from "./api.ts";
import {
  type AuthSession,
  createAuthSession,
  PENDING_LOGOUT_KEY,
} from "./session.ts";

const alice: AuthUser = {
  id: "alice",
  name: "Alice",
  email: "alice@example.test",
  avatar: null,
};
const bob: AuthUser = {
  id: "bob",
  name: "Bob",
  email: "bob@example.test",
  avatar: null,
};
const credentials = { email: "alice@example.test", password: "test-password" };
type Reply = { status?: number; data?: unknown };
type Handler = (config: InternalAxiosRequestConfig) => Reply | Promise<Reply>;

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((accept) => {
    resolve = accept;
  });
  return { promise, resolve };
}

function mockClient(handler: Handler) {
  const calls: InternalAxiosRequestConfig[] = [];
  const client = axios.create({
    baseURL: "/api",
    withCredentials: true,
    adapter: async (config) => {
      calls.push(config);
      const reply = await handler(config);
      const response = {
        status: reply.status ?? 200,
        statusText: "",
        data: reply.data,
        config,
        headers: new AxiosHeaders(),
      };
      if (response.status >= 400)
        throw new AxiosError(
          "Request failed",
          "ERR_BAD_RESPONSE",
          config,
          undefined,
          response,
        );
      return response;
    },
  });
  return { client, calls };
}

const sessions: AuthSession[] = [];
afterEach(() => {
  for (const session of sessions.splice(0)) session.dispose();
});

function harness(
  options: {
    api?: Handler;
    auth?: Handler;
    storage?: Map<string, string>;
    online?: boolean;
    withLock?: <T>(task: () => Promise<T>) => Promise<T>;
  } = {},
) {
  const storage = options.storage ?? new Map<string, string>();
  const publicApi = mockClient(options.api ?? (() => ({ data: alice })));
  const authApi = mockClient(
    options.auth ??
      ((config) => ({
        status: config.url === "/auth/logout" ? 204 : 200,
        data: { user: alice },
      })),
  );
  const onUser = vi.fn();
  const onReset = vi.fn();
  const onNavigateHome = vi.fn();
  const isOnline = vi.fn(() => options.online ?? true);
  const session = createAuthSession({
    api: publicApi.client,
    authApi: authApi.client,
    storage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => {
        storage.set(key, value);
      },
      removeItem: (key) => {
        storage.delete(key);
      },
    },
    isOnline,
    withLock: options.withLock,
    onUser,
    onReset,
    onNavigateHome,
  });
  sessions.push(session);
  return {
    session,
    api: publicApi.client,
    calls: publicApi.calls,
    authApi: authApi.client,
    authCalls: authApi.calls,
    storage,
    onUser,
    onReset,
    onNavigateHome,
    isOnline,
  };
}

describe("API and initialization", () => {
  it("uses the API prefix and cookies without bearer token persistence", () => {
    expect(configuredApi.defaults.baseURL).toBe("/api");
    expect(configuredApi.defaults.withCredentials).toBe(true);
    expect(configuredApi.defaults.headers.common.Authorization).toBeUndefined();
  });

  it("initializes once under repeated StrictMode calls and keeps only public user fields", async () => {
    const h = harness({
      api: () => ({
        data: { ...alice, accessToken: "not-for-redux", password: "private" },
      }),
    });
    await Promise.all([h.session.initialize(), h.session.initialize()]);
    expect(h.calls.map((config) => config.url)).toEqual(["/users/current"]);
    expect(h.onUser).toHaveBeenCalledExactlyOnceWith(alice);
    expect([...h.storage]).toEqual([]);
  });

  it("does not restore an old current-user response after logout", async () => {
    const response = deferred<Reply>();
    const h = harness({ api: () => response.promise });
    const initializing = h.session.initialize();
    await vi.waitFor(() => expect(h.calls).toHaveLength(1));
    await h.session.logout();
    response.resolve({ data: alice });
    await initializing;
    expect(h.onUser).not.toHaveBeenCalled();
    expect(h.onReset).toHaveBeenCalled();
  });
});

describe("401 recovery", () => {
  it("shares one refresh across concurrent failures and retries both requests", async () => {
    const gate = deferred<Reply>();
    let refreshed = false;
    const h = harness({
      api: () => ({ status: refreshed ? 200 : 401, data: "result" }),
      auth: async () => {
        const reply = await gate.promise;
        refreshed = true;
        return reply;
      },
    });
    const requests = [h.api.get("/private/one"), h.api.get("/private/two")];
    await vi.waitFor(() => expect(h.authCalls).toHaveLength(1));
    gate.resolve({ status: 204 });
    const responses = await Promise.all(requests);
    expect(responses.map((response) => response.status)).toEqual([200, 200]);
    expect(h.authCalls.map((config) => config.url)).toEqual(["/auth/refresh"]);
    expect(h.calls).toHaveLength(4);
  });

  it("retries a delayed old 401 using the completed refresh without a second refresh", async () => {
    const delayed = deferred<Reply>();
    let refreshed = false;
    let lateCalls = 0;
    const h = harness({
      api: (config) => {
        if (config.url === "/late" && ++lateCalls === 1) return delayed.promise;
        return { status: refreshed ? 200 : 401 };
      },
      auth: () => {
        refreshed = true;
        return {};
      },
    });
    const late = h.api.get("/late");
    await h.api.get("/first");
    delayed.resolve({ status: 401 });
    await late;
    expect(h.authCalls).toHaveLength(1);
  });

  it("retries at most once and clears the session if the retry is still unauthorized", async () => {
    const h = harness({ api: () => ({ status: 401 }) });
    await expect(h.api.get("/private")).rejects.toBeInstanceOf(AxiosError);
    expect(h.authCalls).toHaveLength(1);
    expect(h.calls).toHaveLength(2);
    expect(h.onReset).toHaveBeenCalled();
  });

  it("does not recurse or refresh login, register, refresh or logout errors", async () => {
    const h = harness({ api: () => ({ status: 401 }) });
    for (const path of [
      "/auth/login",
      "/auth/register",
      "/auth/refresh",
      "/auth/logout",
      "/api/auth/login?test=1",
    ]) {
      await expect(h.api.post(path)).rejects.toBeInstanceOf(AxiosError);
    }
    expect(h.authCalls).toHaveLength(0);
  });

  it("expires the session after a rejected refresh without retrying the original request", async () => {
    const h = harness({
      api: () => ({ status: 401 }),
      auth: () => ({ status: 401 }),
    });
    await expect(h.api.get("/private")).rejects.toBeInstanceOf(AxiosError);
    expect(h.calls).toHaveLength(1);
    expect(h.onReset).toHaveBeenCalledOnce();
  });

  it("does not intercept non-401 failures or refresh a public 200 response", async () => {
    const h = harness({
      api: (config) => ({ status: config.url === "/error" ? 500 : 200 }),
    });
    await expect(h.api.get("/error")).rejects.toBeInstanceOf(AxiosError);
    await h.api.get("/recipes");
    expect(h.authCalls).toHaveLength(0);
  });

  it("does not retry a request if logout happens during refresh", async () => {
    const gate = deferred<Reply>();
    const h = harness({
      api: () => ({ status: 401 }),
      auth: (config) =>
        config.url === "/auth/refresh" ? gate.promise : { status: 204 },
    });
    const request = h.api.get("/private");
    const rejection = expect(request).rejects.toSatisfy(axios.isCancel);
    await vi.waitFor(() => expect(h.authCalls).toHaveLength(1));
    const logout = h.session.logout();
    expect(h.onReset).toHaveBeenCalled();
    gate.resolve({});
    await Promise.all([rejection, logout]);
    expect(h.calls).toHaveLength(1);
    expect(h.authCalls.map((config) => config.url)).toEqual([
      "/auth/refresh",
      "/auth/logout",
    ]);
  });
});

describe("offline logout", () => {
  it("resets Redux and navigates immediately, even while the server has not responded", async () => {
    const gate = deferred<Reply>();
    const h = harness({ auth: () => gate.promise });
    const logout = h.session.logout();
    expect(h.onReset).toHaveBeenCalledOnce();
    expect(h.onNavigateHome).toHaveBeenCalledOnce();
    expect(h.storage.get(PENDING_LOGOUT_KEY)).toBe("true");
    gate.resolve({ status: 204 });
    await logout;
    expect(h.onReset).toHaveBeenCalledTimes(2);
    expect(h.storage.has(PENDING_LOGOUT_KEY)).toBe(false);
  });

  it("persists only the nonsecret flag on a network error", async () => {
    const h = harness({
      auth: () => {
        throw new AxiosError("Network Error", "ERR_NETWORK");
      },
    });
    await h.session.logout();
    expect([...h.storage]).toEqual([[PENDING_LOGOUT_KEY, "true"]]);
    expect(h.onReset).toHaveBeenCalledTimes(2);
    await expect(h.api.get("/public")).resolves.toBeDefined();
    expect(h.authCalls.map((config) => config.url)).toEqual(["/auth/logout"]);
  });

  it("keeps the pending marker on a server failure as well", async () => {
    const h = harness({ auth: () => ({ status: 500 }) });
    await h.session.logout();
    expect(h.session.pendingLogout()).toBe(true);
    expect(h.onReset).toHaveBeenCalled();
  });

  it.each([false, true])(
    "never calls current-user or refresh on pending startup (online=%s)",
    async (online) => {
      const h = harness({
        storage: new Map([[PENDING_LOGOUT_KEY, "true"]]),
        online,
      });
      await h.session.initialize();
      expect(h.calls).toHaveLength(0);
      expect(h.onUser).not.toHaveBeenCalled();
      expect(h.authCalls.map((config) => config.url)).toEqual(
        online ? ["/auth/logout"] : [],
      );
      expect(h.session.pendingLogout()).toBe(!online);
    },
  );

  it("retries pending logout after connectivity returns, without auto-login", async () => {
    const h = harness({
      storage: new Map([[PENDING_LOGOUT_KEY, "true"]]),
      online: false,
    });
    await h.session.initialize();
    h.isOnline.mockReturnValue(true);
    await Promise.all([
      h.session.syncPendingLogout(),
      h.session.syncPendingLogout(),
    ]);
    expect(h.authCalls.map((config) => config.url)).toEqual(["/auth/logout"]);
    expect(h.calls).toHaveLength(0);
    expect(h.session.pendingLogout()).toBe(false);
  });

  it.each(["login", "register"] as const)(
    "clears the old pending flag after successful %s into a different account",
    async (method) => {
      const h = harness({
        storage: new Map([[PENDING_LOGOUT_KEY, "true"]]),
        auth: (config) => ({
          status: config.url === "/auth/logout" ? 204 : 200,
          data: { user: bob, accessToken: "never-store-this" },
        }),
      });
      const user = await h.session[method]({ ...credentials, name: "Bob" });
      expect(user).toEqual(bob);
      expect(h.authCalls.map((config) => config.url)).toEqual([
        "/auth/logout",
        `/auth/${method}`,
      ]);
      expect([...h.storage]).toEqual([]);
      expect(h.onUser).toHaveBeenCalledExactlyOnceWith(bob);
      expect(h.onUser.mock.calls[0][0]).not.toHaveProperty("accessToken");
    },
  );

  it("allows a new login after failed old-session cleanup and only clears the flag on login success", async () => {
    const h = harness({
      storage: new Map([[PENDING_LOGOUT_KEY, "true"]]),
      auth: (config) =>
        config.url === "/auth/logout"
          ? { status: 500 }
          : { data: { user: bob } },
    });
    await h.session.login(credentials);
    expect(h.session.pendingLogout()).toBe(false);
    expect(h.onUser).toHaveBeenLastCalledWith(bob);
  });

  it("does not let an old logout finally block clear a newer login", async () => {
    const oldLogout = deferred<Reply>();
    let logoutCalls = 0;
    const h = harness({
      auth: (config) =>
        config.url === "/auth/logout" && ++logoutCalls === 1
          ? oldLogout.promise
          : { data: { user: bob } },
    });
    const logout = h.session.logout();
    await vi.waitFor(() => expect(h.authCalls).toHaveLength(1));
    const login = h.session.login(credentials);
    oldLogout.resolve({ status: 204 });
    await Promise.all([logout, login]);
    expect(h.onUser).toHaveBeenLastCalledWith(bob);
    const resetCallsAfterLogin = h.onReset.mock.calls.length;
    await h.session.syncPendingLogout();
    expect(h.onReset).toHaveBeenCalledTimes(resetCallsAfterLogin);
    expect(h.session.pendingLogout()).toBe(false);
  });

  it("does not publish an old login that completes after logout", async () => {
    const signingIn = deferred<Reply>();
    const h = harness({
      auth: (config) =>
        config.url === "/auth/login" ? signingIn.promise : { status: 204 },
    });
    const login = h.session.login(credentials);
    const rejected = expect(login).rejects.toSatisfy(axios.isCancel);
    await vi.waitFor(() => expect(h.authCalls).toHaveLength(1));
    const logout = h.session.logout();
    signingIn.resolve({ data: { user: alice } });
    await Promise.all([rejected, logout]);
    expect(h.onUser).not.toHaveBeenCalled();
    expect(h.authCalls.map((config) => config.url)).toEqual([
      "/auth/login",
      "/auth/logout",
    ]);
  });
});

describe("tab synchronization and Redux", () => {
  it("clears another tab and ignores unrelated storage events", async () => {
    const storage = new Map<string, string>();
    const h = harness({ storage, online: false });
    await h.session.login(credentials);
    h.onReset.mockClear();
    h.session.handleStorageEvent({ key: "other", newValue: "true" });
    expect(h.onReset).not.toHaveBeenCalled();
    storage.set(PENDING_LOGOUT_KEY, "true");
    await h.session.handleStorageEvent({
      key: PENDING_LOGOUT_KEY,
      newValue: "true",
    });
    expect(h.onReset).toHaveBeenCalledOnce();
    expect(h.onNavigateHome).toHaveBeenCalledOnce();
  });

  it("ignores a delayed storage event from before a newer successful login", async () => {
    const h = harness();
    await h.session.login(credentials);
    h.onReset.mockClear();
    h.session.handleStorageEvent({ key: PENDING_LOGOUT_KEY, newValue: "true" });
    expect(h.onReset).not.toHaveBeenCalled();
  });

  it("serializes cleanup and new login across tabs using a shared lock", async () => {
    let queue: Promise<unknown> = Promise.resolve();
    const withLock = <T>(task: () => Promise<T>): Promise<T> => {
      const result = queue.then(task);
      queue = result.catch(() => undefined);
      return result;
    };
    const gate = deferred<Reply>();
    const storage = new Map([[PENDING_LOGOUT_KEY, "true"]]);
    const oldTab = harness({ storage, withLock, auth: () => gate.promise });
    const newTab = harness({
      storage,
      withLock,
      auth: () => ({ data: { user: bob } }),
    });
    const cleanup = oldTab.session.syncPendingLogout();
    await vi.waitFor(() => expect(oldTab.authCalls).toHaveLength(1));
    const login = newTab.session.login(credentials);
    expect(newTab.authCalls).toHaveLength(0);
    gate.resolve({ status: 204 });
    await Promise.all([cleanup, login]);
    expect(newTab.authCalls.map((config) => config.url)).toEqual([
      "/auth/login",
    ]);
    expect(newTab.onUser).toHaveBeenLastCalledWith(bob);
  });

  it("clears the auth state through the shared root reset action", () => {
    const loggedIn = rootReducer(undefined, sessionReceived(alice));
    expect(loggedIn.auth.user).toEqual(alice);
    const loggedOut = rootReducer(loggedIn, sessionCleared());
    expect(loggedOut.auth).toMatchObject({
      user: null,
      isInitialized: true,
      isLoading: false,
      error: null,
    });
    expect(loggedOut.auth).not.toHaveProperty("accessToken");
    expect(loggedOut.auth).not.toHaveProperty("refreshToken");
  });
});

describe("late storage notifications", () => {
  it("clears a background tab even if successful logout already removed the flag", async () => {
    const h = harness({
      auth: (config) =>
        config.url === "/users/current"
          ? { status: 401 }
          : { data: { user: alice } },
    });
    await h.session.login(credentials);
    h.onReset.mockClear();
    await h.session.handleStorageEvent({
      key: PENDING_LOGOUT_KEY,
      newValue: "true",
    });
    expect(h.onReset).toHaveBeenCalledOnce();
    expect(
      h.authCalls.filter((config) => config.url === "/auth/refresh"),
    ).toHaveLength(0);
  });

  it("keeps a newer valid account when an older logout event arrives late", async () => {
    const h = harness({ auth: () => ({ data: { user: bob } }) });
    await h.session.login(credentials);
    h.onReset.mockClear();
    await h.session.handleStorageEvent({
      key: PENDING_LOGOUT_KEY,
      newValue: "true",
    });
    expect(h.onReset).not.toHaveBeenCalled();
    expect(h.onUser).toHaveBeenLastCalledWith(bob);
  });

  it("rejects a response whose request was started immediately before logout", async () => {
    const gate = deferred<Reply>();
    const h = harness({ api: () => gate.promise });
    const request = h.api.get("/profile");
    const rejected = expect(request).rejects.toSatisfy(axios.isCancel);
    const logout = h.session.logout();
    gate.resolve({ data: alice });
    await Promise.all([rejected, logout]);
  });
});

describe("unavailable browser facilities", () => {
  it("still logs out locally when the cross-tab lock rejects", async () => {
    const h = harness({
      withLock: async () => {
        throw new Error("Lock unavailable");
      },
    });
    await expect(h.session.logout()).resolves.toBeUndefined();
    expect(h.onReset).toHaveBeenCalledTimes(2);
    expect(h.onNavigateHome).toHaveBeenCalled();
    expect(h.session.pendingLogout()).toBe(true);
    await expect(h.session.syncPendingLogout()).resolves.toBe(false);
  });

  it("still clears the session when localStorage is unavailable", async () => {
    const { client } = mockClient(() => {
      throw new AxiosError("Offline", "ERR_NETWORK");
    });
    const onReset = vi.fn();
    const onNavigateHome = vi.fn();
    const unavailable = () => {
      throw new Error("Storage unavailable");
    };
    const session = createAuthSession({
      api: client,
      authApi: client,
      storage: {
        getItem: unavailable,
        setItem: unavailable,
        removeItem: unavailable,
      },
      isOnline: () => false,
      onUser: vi.fn(),
      onReset,
      onNavigateHome,
    });
    sessions.push(session);
    await session.logout();
    expect(onReset).toHaveBeenCalledTimes(2);
    expect(onNavigateHome).toHaveBeenCalled();
    expect(session.pendingLogout()).toBe(true);
  });

  it("does not clear an existing user solely because refresh has a network error", async () => {
    const h = harness({
      api: () => ({ status: 401 }),
      auth: (config) => {
        if (config.url === "/auth/login") return { data: { user: alice } };
        throw new AxiosError("Offline", "ERR_NETWORK");
      },
    });
    await h.session.login(credentials);
    h.onReset.mockClear();
    await expect(h.api.get("/private")).rejects.toBeInstanceOf(AxiosError);
    expect(h.onReset).not.toHaveBeenCalled();
    expect(h.onUser).toHaveBeenLastCalledWith(alice);
  });
});

describe("login during pending logout", () => {
  it("does not cancel a new login when an older logout storage event arrives during cleanup", async () => {
    const cleanup = deferred<Reply>();
    const h = harness({
      storage: new Map([[PENDING_LOGOUT_KEY, "true"]]),
      auth: (config) =>
        config.url === "/auth/logout"
          ? cleanup.promise
          : { data: { user: bob } },
    });
    const login = h.session.login(credentials);
    const result = login.then(
      (user) => ({ user }),
      (error) => ({ error }),
    );
    await vi.waitFor(() => expect(h.authCalls).toHaveLength(1));
    const event = h.session.handleStorageEvent({
      key: PENDING_LOGOUT_KEY,
      newValue: "true",
    });
    cleanup.resolve({ status: 204 });
    await event;
    expect(await result).toEqual({ user: bob });
    expect(h.onUser).toHaveBeenLastCalledWith(bob);
    expect(h.session.pendingLogout()).toBe(false);
  });
});

describe("startup connection recovery", () => {
  it("retries a failed initial lookup when the network returns", async () => {
    let online = false;
    const h = harness({
      api: () => {
        if (!online) throw new AxiosError("Offline", "ERR_NETWORK");
        return { data: alice };
      },
    });
    await h.session.initialize();
    expect(h.onUser).not.toHaveBeenCalled();
    online = true;
    await h.session.handleOnline();
    expect(h.onUser).toHaveBeenCalledExactlyOnceWith(alice);
    expect(h.calls.map((config) => config.url)).toEqual([
      "/users/current",
      "/users/current",
    ]);
  });

  it("does not auto-login on reconnect after explicit logout, even if startup initially failed", async () => {
    let online = false;
    const h = harness({
      api: () => {
        if (!online) throw new AxiosError("Offline", "ERR_NETWORK");
        return { data: alice };
      },
    });
    await h.session.initialize();
    await h.session.logout();
    online = true;
    await h.session.handleOnline();
    expect(h.onUser).not.toHaveBeenCalled();
    expect(h.calls).toHaveLength(1);
  });

  it("prioritizes pending logout over session recovery", async () => {
    const h = harness({
      storage: new Map([[PENDING_LOGOUT_KEY, "true"]]),
      online: false,
    });
    await h.session.initialize();
    h.isOnline.mockReturnValue(true);
    await h.session.handleOnline();
    expect(h.authCalls.map((config) => config.url)).toEqual(["/auth/logout"]);
    expect(h.calls).toHaveLength(0);
    expect(h.onUser).not.toHaveBeenCalled();
  });
});
