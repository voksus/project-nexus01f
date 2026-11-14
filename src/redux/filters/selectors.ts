import type { RootState } from "../store.ts";

export const selectIngredients = (state: RootState) =>
  state.filters.ingredients;
export const selectAreas = (state: RootState) => state.filters.areas;
