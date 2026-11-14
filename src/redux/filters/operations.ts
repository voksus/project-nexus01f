import { createAsyncThunk } from "@reduxjs/toolkit";
import { getAreas, getIngredients } from "../../services/recipesApi.ts";
import type { Area, Ingredient } from "../../types/api.ts";
import { getErrorMessage } from "../../utils/getErrorMessage.ts";
import type { RootState } from "../store.ts";

export const fetchFilterOptions = createAsyncThunk<
  { ingredients: Ingredient[]; areas: Area[] },
  void,
  { state: RootState; rejectValue: string }
>(
  "filters/fetchOptions",
  async (_, { rejectWithValue }) => {
    try {
      const [ingredients, areas] = await Promise.all([
        getIngredients(),
        getAreas(),
      ]);
      return { ingredients, areas };
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error, "Unable to load recipe filters."),
      );
    }
  },
  {
    // Ingredients and areas are cached in the store, so load them only once
    condition: (_, { getState }) => {
      const { status } = getState().filters;
      return status !== "loading" && status !== "succeeded";
    },
  },
);
