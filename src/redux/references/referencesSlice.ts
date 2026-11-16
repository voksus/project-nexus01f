import { createSlice } from "@reduxjs/toolkit";
import type { Area, Category, Ingredient } from "../../types/api.ts";
import { fetchAreas, fetchCategories, fetchIngredients } from "./operations.ts";

export type LoadStatus = "idle" | "loading" | "succeeded" | "failed";

export interface ReferenceList<T> {
  items: T[];
  status: LoadStatus;
  error: string | null;
}

interface ReferencesState {
  categories: ReferenceList<Category>;
  areas: ReferenceList<Area>;
  ingredients: ReferenceList<Ingredient>;
}

const createList = <T>(): ReferenceList<T> => ({
  items: [],
  status: "idle",
  error: null,
});

const initialState: ReferencesState = {
  categories: createList(),
  areas: createList(),
  ingredients: createList(),
};

type ListStatus = Pick<ReferenceList<unknown>, "status" | "error">;

const markPending = (list: ListStatus) => {
  list.status = "loading";
  list.error = null;
};

const markFailed = (list: ListStatus, message: string) => {
  list.status = "failed";
  list.error = message;
};

const referencesSlice = createSlice({
  name: "references",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        markPending(state.categories);
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = {
          items: action.payload,
          status: "succeeded",
          error: null,
        };
      })
      .addCase(fetchCategories.rejected, (state) => {
        markFailed(state.categories, "Unable to load categories.");
      })
      .addCase(fetchAreas.pending, (state) => {
        markPending(state.areas);
      })
      .addCase(fetchAreas.fulfilled, (state, action) => {
        state.areas = {
          items: action.payload,
          status: "succeeded",
          error: null,
        };
      })
      .addCase(fetchAreas.rejected, (state) => {
        markFailed(state.areas, "Unable to load areas.");
      })
      .addCase(fetchIngredients.pending, (state) => {
        markPending(state.ingredients);
      })
      .addCase(fetchIngredients.fulfilled, (state, action) => {
        state.ingredients = {
          items: action.payload,
          status: "succeeded",
          error: null,
        };
      })
      .addCase(fetchIngredients.rejected, (state) => {
        markFailed(state.ingredients, "Unable to load ingredients.");
      });
  },
});

export const referencesReducer = referencesSlice.reducer;
