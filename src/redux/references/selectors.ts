import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "../store.ts";

export const selectCategoriesList = (state: RootState) =>
  state.references.categories;
export const selectAreasList = (state: RootState) => state.references.areas;
export const selectIngredientsList = (state: RootState) =>
  state.references.ingredients;

export const selectCategories = (state: RootState) =>
  state.references.categories.items;
export const selectAreas = (state: RootState) => state.references.areas.items;
export const selectIngredients = (state: RootState) =>
  state.references.ingredients.items;

/** O(1) ingredient lookup by id */
export const selectIngredientsById = createSelector(
  [selectIngredients],
  (items) => new Map(items.map((item) => [item.id, item])),
);
