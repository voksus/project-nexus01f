import { createSlice } from "@reduxjs/toolkit";
import type { RecipeCardItem } from "../../types/api.ts";
import { fetchRecipes } from "./operations.ts";

interface RecipesState {
  items: RecipeCardItem[];
  total: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
}

const initialState: RecipesState = {
  items: [],
  total: 0,
  totalPages: 1,
  // The section requests recipes right after mounting, so there is no idle state
  isLoading: true,
  error: null,
};

const recipesSlice = createSlice({
  name: "recipes",
  initialState,
  reducers: {
    resetRecipes: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        // Aborted requests are superseded by a newer one that owns the loading state
        if (action.meta.aborted) return;
        state.isLoading = false;
        state.error = action.payload ?? "Unable to load recipes.";
      });
  },
});

export const { resetRecipes } = recipesSlice.actions;
export const recipesReducer = recipesSlice.reducer;
