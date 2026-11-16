import { createAsyncThunk } from "@reduxjs/toolkit";
import * as referencesApi from "../../services/referencesApi.ts";
import type { RootState } from "../store.ts";

export type ReferenceKey = "categories" | "areas" | "ingredients";

const createAppAsyncThunk = createAsyncThunk.withTypes<{ state: RootState }>();

// Skip while loading or loaded; allow a retry after failure
const shouldFetch =
  (key: ReferenceKey) =>
  (_arg: unknown, { getState }: { getState: () => RootState }) => {
    const { status } = getState().references[key];
    return status === "idle" || status === "failed";
  };

export const fetchCategories = createAppAsyncThunk(
  "references/fetchCategories",
  (_arg: undefined, { signal }) => referencesApi.fetchCategories(signal),
  { condition: shouldFetch("categories") },
);

export const fetchAreas = createAppAsyncThunk(
  "references/fetchAreas",
  (_arg: undefined, { signal }) => referencesApi.fetchAreas(signal),
  { condition: shouldFetch("areas") },
);

export const fetchIngredients = createAppAsyncThunk(
  "references/fetchIngredients",
  (_arg: undefined, { signal }) => referencesApi.fetchIngredients(signal),
  { condition: shouldFetch("ingredients") },
);

export const referenceThunks = {
  categories: fetchCategories,
  areas: fetchAreas,
  ingredients: fetchIngredients,
} as const;
