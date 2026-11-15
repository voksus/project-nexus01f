import { type AxiosAdapter, AxiosError, AxiosHeaders } from "axios";
import {
  afterAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { api, authApi } from "../../services/api.ts";
import { PENDING_LOGOUT_KEY } from "../../services/session.ts";
import { sessionCleared } from "../sessionActions.ts";
import { authSession, setAuthNavigation, store } from "../store.ts";
import { login, logout, register } from "./operations.ts";

const user = {
  id: "account",
  name: "Alice",
  email: "alice@example.test",
  avatar: null,
};
let storage: Map<string, string>;
let navigateHome = vi.fn<() => void>();

const adapter: AxiosAdapter = async (config) => ({
  status: 200,
  statusText: "OK",
  config,
  headers: new AxiosHeaders(),
  data: {
    user,
    accessToken: "must-not-be-stored",
    refreshToken: "must-not-be-stored",
  },
});

beforeEach(() => {
  storage = new Map();
  navigateHome = vi.fn<() => void>();
  vi.stubGlobal("window", {
    localStorage: {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => {
        storage.set(key, value);
      },
      removeItem: (key: string) => {
        storage.delete(key);
      },
    },
  });
  vi.stubGlobal("navigator", { onLine: true });
  setAuthNavigation(navigateHome);
  store.dispatch(sessionCleared());
  api.defaults.adapter = adapter;
  authApi.defaults.adapter = adapter;
});
afterEach(() => {
  vi.unstubAllGlobals();
});
afterAll(() => {
  authSession.dispose();
});

describe("Redux authentication operations", () => {
  it.each(["login", "register"] as const)(
    "stores only the user on %s and never persists credentials or tokens",
    async (method) => {
      const credentials = {
        name: "Alice",
        email: " ALICE@EXAMPLE.TEST ",
        password: "private-password",
      };
      const requests: string[] = [];
      authApi.defaults.adapter = async (config) => {
        requests.push(config.data);
        return adapter(config);
      };
      const result = await store.dispatch(
        method === "login" ? login(credentials) : register(credentials),
      );
      expect(result).toEqual(user);
      expect(store.getState().auth).toMatchObject({
        user,
        isLoading: false,
        isInitialized: true,
        error: null,
      });
      expect(JSON.parse(requests[0]).email).toBe("alice@example.test");
      const state = JSON.stringify(store.getState());
      expect(state).not.toContain("must-not-be-stored");
      expect(state).not.toContain("private-password");
      expect([...storage]).toEqual([]);
    },
  );

  it("clears Redux and redirects before a slow logout completes", async () => {
    await store.dispatch(login({ email: user.email, password: "password" }));
    let finish!: () => void;
    const waiting = new Promise<void>((resolve) => {
      finish = resolve;
    });
    authApi.defaults.adapter = async (config) => {
      await waiting;
      return adapter(config);
    };
    const pending = store.dispatch(logout());
    expect(store.getState().auth.user).toBeNull();
    expect(navigateHome).toHaveBeenCalledOnce();
    expect(storage.get(PENDING_LOGOUT_KEY)).toBe("true");
    finish();
    await pending;
    expect(store.getState().auth.user).toBeNull();
    expect(storage.has(PENDING_LOGOUT_KEY)).toBe(false);
  });

  it("exposes invalid credentials without an automatic refresh", async () => {
    const requests: string[] = [];
    authApi.defaults.adapter = async (config) => {
      requests.push(config.url ?? "");
      throw new AxiosError(
        "Unauthorized",
        "ERR_BAD_RESPONSE",
        config,
        undefined,
        {
          status: 401,
          statusText: "Unauthorized",
          config,
          headers: new AxiosHeaders(),
          data: { message: "Invalid credentials" },
        },
      );
    };
    await expect(
      store.dispatch(login({ email: user.email, password: "wrong" })),
    ).rejects.toBeInstanceOf(AxiosError);
    expect(store.getState().auth).toMatchObject({
      user: null,
      isLoading: false,
      error: "Invalid credentials",
    });
    expect(requests).toEqual(["/auth/login"]);
  });

  it("completes local logout even when the request has a network error", async () => {
    await store.dispatch(login({ email: user.email, password: "password" }));
    authApi.defaults.adapter = async () => {
      throw new AxiosError("Network Error", "ERR_NETWORK");
    };
    await store.dispatch(logout());
    expect(store.getState().auth.user).toBeNull();
    expect(navigateHome).toHaveBeenCalled();
    expect([...storage]).toEqual([[PENDING_LOGOUT_KEY, "true"]]);
  });
});
