import { createAsyncThunk } from "@reduxjs/toolkit";
import { getRecipes } from "../../services/recipesApi.ts";
import type {
  PaginatedResponse,
  RecipeCardItem,
  RecipesQuery,
} from "../../types/api.ts";
import { getErrorMessage } from "../../utils/getErrorMessage.ts";

export const fetchRecipes = createAsyncThunk<
  PaginatedResponse<RecipeCardItem>,
  RecipesQuery,
  { rejectValue: string }
>("recipes/fetchRecipes", async (query, { signal, rejectWithValue }) => {
  try {
    return await getRecipes(query, signal);
  } catch (error) {
    return rejectWithValue(
      getErrorMessage(error, "Unable to load recipes. Please try again."),
    );
  }
});
