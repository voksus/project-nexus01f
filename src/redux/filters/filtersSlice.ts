import { createSlice } from "@reduxjs/toolkit";
import type { Area, Ingredient } from "../../types/api.ts";
import { fetchFilterOptions } from "./operations.ts";

interface FiltersState {
  ingredients: Ingredient[];
  areas: Area[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
}

const initialState: FiltersState = {
  ingredients: [],
  areas: [],
  status: "idle",
  error: null,
};

const filtersSlice = createSlice({
  name: "filters",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchFilterOptions.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchFilterOptions.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.ingredients = action.payload.ingredients;
        state.areas = action.payload.areas;
      })
      .addCase(fetchFilterOptions.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload ?? "Unable to load recipe filters.";
      });
  },
});

export const filtersReducer = filtersSlice.reducer;
