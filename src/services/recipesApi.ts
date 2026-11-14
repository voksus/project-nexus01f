import type {
  Area,
  CreatedRecipe,
  Ingredient,
  PaginatedResponse,
  RecipeCardItem,
  RecipesQuery,
} from "../types/api.ts";
import { api } from "./api.ts";

// 5 MB uploads and Render cold starts exceed the default 10 s
const UPLOAD_TIMEOUT_MS = 60_000;

export const createRecipe = async (
  formData: FormData,
): Promise<CreatedRecipe> => {
  // axios sets the multipart boundary itself
  const { data } = await api.post<unknown>("/recipes", formData, {
    timeout: UPLOAD_TIMEOUT_MS,
  });

  if (
    typeof data !== "object" ||
    data === null ||
    !("id" in data) ||
    typeof data.id !== "string"
  ) {
    throw new Error("Unexpected /recipes response shape");
  }

  return { id: data.id };
};

export const getRecipes = async (query: RecipesQuery, signal?: AbortSignal) => {
  const { data } = await api.get<PaginatedResponse<RecipeCardItem>>(
    "/recipes",
    { params: query, signal },
  );
  return data;
};

export const getIngredients = async () => {
  const { data } = await api.get<Ingredient[]>("/ingredients");
  return data;
};

export const getAreas = async () => {
  const { data } = await api.get<Area[]>("/areas");
  return data;
};

export const addRecipeToFavorites = async (recipeId: string) => {
  await api.post(`/recipes/${encodeURIComponent(recipeId)}/favorite`);
};

export const removeRecipeFromFavorites = async (recipeId: string) => {
  await api.delete(`/recipes/${encodeURIComponent(recipeId)}/favorite`);
};
