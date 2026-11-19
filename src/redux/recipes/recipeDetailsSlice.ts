import { createSlice } from "@reduxjs/toolkit";
import type { RecipeDetails } from "../../types/api.ts";
import { fetchRecipeById } from "./operations.ts";

interface RecipeDetailsState {
  item: RecipeDetails | null;
  isRecipeLoading: boolean;
  error: string | null;
}

const initialState: RecipeDetailsState = {
  item: null,
  // The page requests recipe details right after mounting, so there is no idle state
  isRecipeLoading: true,
  error: null,
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
        state.isRecipeLoading = true;
        state.error = null;
      })
      .addCase(fetchRecipeById.fulfilled, (state, action) => {
        state.isRecipeLoading = false;
        state.item = action.payload;
      })
      .addCase(fetchRecipeById.rejected, (state, action) => {
        // Aborted requests are superseded by a newer one that owns the loading state
        if (action.meta.aborted) return;
        state.isRecipeLoading = false;
        state.error = action.payload ?? "Unable to load recipe.";
      });
  },
});

export const { resetRecipeDetails } = recipeDetailsSlice.actions;
export const recipeDetailsReducer = recipeDetailsSlice.reducer;
