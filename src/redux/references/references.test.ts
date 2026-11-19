import { configureStore } from "@reduxjs/toolkit";
import {
  type AxiosAdapter,
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { publicApi } from "../../services/api.ts";
import { sessionReceived } from "../auth/authSlice.ts";
import { rootReducer } from "../rootReducer.ts";
import { sessionCleared } from "../sessionActions.ts";
import { fetchAreas, fetchCategories, fetchIngredients } from "./operations.ts";
import { selectIngredientsById } from "./selectors.ts";

const originalAdapter = publicApi.defaults.adapter;
const responses = new Map<string, unknown>();

const respond = (
  config: InternalAxiosRequestConfig,
  data: unknown,
): AxiosResponse => ({
  status: 200,
  statusText: "OK",
  config,
  headers: new AxiosHeaders(),
  data,
});

const adapter = vi.fn<AxiosAdapter>(async (config) => {
  const url = config.url ?? "";
  if (!responses.has(url)) {
    throw new AxiosError(
      "Request failed with status code 500",
      AxiosError.ERR_BAD_RESPONSE,
      config,
      null,
      { ...respond(config, { message: "boom" }), status: 500 },
    );
  }
  return respond(config, responses.get(url));
});

const createStore = () => configureStore({ reducer: rootReducer });

beforeEach(() => {
  responses.clear();
  adapter.mockClear();
  publicApi.defaults.adapter = adapter;
});

afterAll(() => {
  publicApi.defaults.adapter = originalAdapter;
});

describe("references", () => {
  it("loads lists and skips malformed items", async () => {
    responses.set("/categories", [
      { id: "c1", name: "Beef", extra: true },
      { id: 2, name: "Broken" },
      null,
    ]);
    responses.set("/ingredients", [
      { id: "i1", name: "Ackee", desc: "Fruit", img: "https://img/ackee.png" },
      { id: "i2", name: "Salt" },
    ]);
    const store = createStore();

    await store.dispatch(fetchCategories());
    await store.dispatch(fetchIngredients());

    const { categories, ingredients } = store.getState().references;
    expect(categories).toEqual({
      items: [{ id: "c1", name: "Beef" }],
      status: "succeeded",
      error: null,
    });
    expect(ingredients.items).toEqual([
      { id: "i1", name: "Ackee", desc: "Fruit", img: "https://img/ackee.png" },
      { id: "i2", name: "Salt", desc: null, img: null },
    ]);
    expect(selectIngredientsById(store.getState()).get("i2")?.name).toBe(
      "Salt",
    );
  });

  it("does not refetch while loading or after success", async () => {
    responses.set("/areas", [{ id: "a1", name: "Ukrainian" }]);
    const store = createStore();

    await Promise.all([
      store.dispatch(fetchAreas()),
      store.dispatch(fetchAreas()),
    ]);
    await store.dispatch(fetchAreas());

    expect(adapter).toHaveBeenCalledTimes(1);
    expect(store.getState().references.areas.status).toBe("succeeded");
  });

  it("reports a failure and allows a retry", async () => {
    const store = createStore();

    await store.dispatch(fetchCategories());
    expect(store.getState().references.categories).toMatchObject({
      status: "failed",
      error: "Unable to load categories.",
      items: [],
    });

    responses.set("/categories", [{ id: "c1", name: "Beef" }]);
    await store.dispatch(fetchCategories());

    expect(adapter).toHaveBeenCalledTimes(2);
    expect(store.getState().references.categories).toMatchObject({
      status: "succeeded",
      error: null,
    });
  });

  it("rejects a non-array response", async () => {
    responses.set("/areas", { items: [] });
    const store = createStore();

    await store.dispatch(fetchAreas());

    expect(store.getState().references.areas.status).toBe("failed");
  });

  it("keeps public references when the session is cleared", async () => {
    responses.set("/categories", [{ id: "c1", name: "Beef" }]);
    const store = createStore();
    store.dispatch(
      sessionReceived({
        id: "u1",
        name: "Alice",
        email: "a@x.test",
        avatar: null,
      }),
    );
    await store.dispatch(fetchCategories());

    store.dispatch(sessionCleared());

    const state = store.getState();
    expect(state.auth.user).toBeNull();
    expect(state.references.categories.items).toEqual([
      { id: "c1", name: "Beef" },
    ]);
    expect(state.references.areas.status).toBe("idle");
  });
});
