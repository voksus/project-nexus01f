import type { CreatedRecipe } from "../types/api.ts";
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
