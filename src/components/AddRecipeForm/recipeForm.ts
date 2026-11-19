import axios from "axios";
import { array, mixed, number, type ObjectSchema, object, string } from "yup";

export const TITLE_MIN = 3;
export const TITLE_MAX = 100;
export const DESCRIPTION_MAX = 200;
export const INSTRUCTIONS_MAX = 1000;

export const TIME_MIN = 1;
export const TIME_MAX = 1440;
export const TIME_STEP = 5;
export const TIME_DEFAULT = 10;

// Same limits as the backend
export const THUMB_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const THUMB_MAX_BYTES = 5 * 1024 * 1024;

export interface RecipeIngredientValue {
  id: string;
  measure: string;
}

export interface RecipeFormValues {
  thumb: File | null;
  title: string;
  description: string;
  categoryId: string;
  areaId: string;
  time: number;
  ingredients: RecipeIngredientValue[];
  instructions: string;
}

export type RecipeFormErrors = Partial<Record<keyof RecipeFormValues, string>>;

export const initialRecipeValues: RecipeFormValues = {
  thumb: null,
  title: "",
  description: "",
  categoryId: "",
  areaId: "",
  time: TIME_DEFAULT,
  ingredients: [],
  instructions: "",
};

const thumbSchema = (required: boolean) =>
  mixed<File>()
    .nullable()
    .defined()
    .test(
      "required",
      "Add a photo of the dish",
      (file) => !required || file instanceof File,
    )
    .test(
      "type",
      "Use a JPEG, PNG or WebP image",
      (file) => !file || THUMB_TYPES.includes(file.type),
    )
    .test(
      "size",
      "The photo must be 5 MB or smaller",
      (file) => !file || file.size <= THUMB_MAX_BYTES,
    );

export const recipeSchema: ObjectSchema<RecipeFormValues> = object({
  thumb: thumbSchema(true),
  title: string()
    .trim()
    .required("Enter the recipe name")
    .min(TITLE_MIN, `Use at least ${TITLE_MIN} characters`)
    .max(TITLE_MAX, `Use at most ${TITLE_MAX} characters`),
  description: string()
    .trim()
    .required("Enter a short description")
    .max(DESCRIPTION_MAX, `Use at most ${DESCRIPTION_MAX} characters`),
  categoryId: string().required("Select a category"),
  areaId: string().required("Select an area"),
  time: number()
    .typeError("Enter the cooking time in minutes")
    .integer("Use whole minutes")
    .min(TIME_MIN, `At least ${TIME_MIN} minute`)
    .max(TIME_MAX, `At most ${TIME_MAX} minutes (24 hours)`)
    .required("Enter the cooking time"),
  ingredients: array(
    object({
      id: string().required(),
      measure: string().trim().required("Enter the quantity"),
    }),
  )
    .required()
    .min(1, "Add at least one ingredient")
    .test(
      "unique",
      "Each ingredient can be added only once",
      (list) => new Set(list.map(({ id }) => id)).size === list.length,
    ),
  instructions: string()
    .trim()
    .required("Describe how to cook the dish")
    .max(INSTRUCTIONS_MAX, `Use at most ${INSTRUCTIONS_MAX} characters`),
});

export const editRecipeSchema: ObjectSchema<RecipeFormValues> =
  recipeSchema.shape({
    thumb: thumbSchema(false),
  });

export const clampTime = (minutes: number) =>
  Math.min(TIME_MAX, Math.max(TIME_MIN, Math.round(minutes)));

/** ±5 min step snapped to multiples of 5 */
export const stepTime = (minutes: number, direction: 1 | -1) =>
  clampTime(
    direction > 0
      ? Math.floor(minutes / TIME_STEP) * TIME_STEP + TIME_STEP
      : Math.ceil(minutes / TIME_STEP) * TIME_STEP - TIME_STEP,
  );

/** Digits only, clamped to 1…1440; null otherwise */
export const parseTimeInput = (raw: string): number | null => {
  const value = raw.trim();
  return /^\d+$/.test(value) ? clampTime(Number(value)) : null;
};

/** Backend format: time as a string, ingredients as a JSON string */
export const toRecipeFormData = (values: RecipeFormValues): FormData => {
  const formData = new FormData();
  formData.append("title", values.title.trim());
  formData.append("description", values.description.trim());
  formData.append("instructions", values.instructions.trim());
  formData.append("categoryId", values.categoryId);
  formData.append("areaId", values.areaId);
  formData.append("time", String(values.time));
  formData.append(
    "ingredients",
    JSON.stringify(
      values.ingredients.map(({ id, measure }) => ({
        id,
        measure: measure.trim(),
      })),
    ),
  );
  if (values.thumb) formData.append("thumb", values.thumb);
  return formData;
};

const FIELD_NAMES = new Set<string>(Object.keys(initialRecipeValues));
const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

/** Maps a backend ErrorResponse to a message and field errors */
export const parseSubmitError = (
  error: unknown,
  fallback = "Unable to publish the recipe. Please try again.",
): { message: string; fieldErrors: RecipeFormErrors } => {
  const fieldErrors: RecipeFormErrors = {};
  const data: unknown = axios.isAxiosError(error)
    ? error.response?.data
    : undefined;

  if (isRecord(data) && Array.isArray(data.errors)) {
    for (const item of data.errors) {
      if (!isRecord(item) || typeof item.message !== "string") continue;
      // "ingredients[0].id" / "ingredients.0.id" → "ingredients"
      const field = String(item.path ?? "").split(/[.[]/)[0];
      if (FIELD_NAMES.has(field)) {
        fieldErrors[field as keyof RecipeFormValues] ??= item.message;
      }
    }
  }

  const message =
    isRecord(data) && typeof data.message === "string" && data.message
      ? data.message
      : fallback;

  return { message, fieldErrors };
};
