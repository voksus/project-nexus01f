import { createSlice } from "@reduxjs/toolkit";
import type { RecipeDetails } from "../../types/api.ts";
import { fetchRecipeById } from "./operations.ts";

interface RecipeDetailsState {
  item: RecipeDetails | null;
  isLoading: boolean;
  error: string | null;
  isFavoriteLoading: boolean;
}

const initialState: RecipeDetailsState = {
  item: null,
  // The page requests recipe details right after mounting, so there is no idle state
  isLoading: true,
  error: null,
  isFavoriteLoading: false,
};

const recipeDetailsSlice = createSlice({
  name: "recipeDetails",
  initialState,
  reducers: {
    resetRecipeDetails: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipeById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRecipeById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.item = action.payload;
      })
      .addCase(fetchRecipeById.rejected, (state, action) => {
        // Aborted requests are superseded by a newer one that owns the loading state
        if (action.meta.aborted) return;
        state.isLoading = false;
        state.error = action.payload ?? "Unable to load recipe.";
      });
  },
});

export const { resetRecipeDetails } = recipeDetailsSlice.actions;
export const recipeDetailsReducer = recipeDetailsSlice.reducer;
