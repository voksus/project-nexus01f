import { createSlice } from "@reduxjs/toolkit";
import type { RecipeCardItem } from "../../types/api.ts";
import { fetchPopularRecipes } from "./operations.ts";

interface PopularRecipesState {
  items: RecipeCardItem[];
  isLoading: boolean;
  error: string | null;
}

const initialState: PopularRecipesState = {
  items: [],
  // The section requests popular recipes right after mounting, so there is no idle state
  isLoading: true,
  error: null,
};

const popularRecipesSlice = createSlice({
  name: "popularRecipes",
  initialState,
  reducers: {
    resetPopularRecipes: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPopularRecipes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPopularRecipes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.items = action.payload;
      })
      .addCase(fetchPopularRecipes.rejected, (state, action) => {
        // Aborted requests are superseded by a newer one that owns the loading state
        if (action.meta.aborted) return;
        state.isLoading = false;
        state.error = action.payload ?? "Unable to load popular recipes.";
      });
  },
});

export const { resetPopularRecipes } = popularRecipesSlice.actions;
export const popularRecipesReducer = popularRecipesSlice.reducer;
