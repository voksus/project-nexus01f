import type { RootState } from "../store.ts";

export const selectRecipes = (state: RootState) => state.recipes.items;
export const selectRecipesTotalPages = (state: RootState) =>
  state.recipes.totalPages;
export const selectRecipesIsLoading = (state: RootState) =>
  state.recipes.isLoading;
export const selectRecipesError = (state: RootState) => state.recipes.error;

export const selectRecipeDetails = (state: RootState) =>
  state.recipeDetails.item;
export const selectRecipeDetailsIsLoading = (state: RootState) =>
  state.recipeDetails.isLoading;
export const selectRecipeDetailsError = (state: RootState) =>
  state.recipeDetails.error;

export const selectPopularRecipes = (state: RootState) =>
  state.popularRecipes.items;
export const selectPopularRecipesIsLoading = (state: RootState) =>
  state.popularRecipes.isLoading;
export const selectPopularRecipesError = (state: RootState) =>
  state.popularRecipes.error;
