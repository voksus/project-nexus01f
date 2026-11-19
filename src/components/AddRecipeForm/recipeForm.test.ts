import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";
import { ValidationError } from "yup";
import {
  editRecipeSchema,
  initialRecipeValues,
  parseSubmitError,
  parseTimeInput,
  type RecipeFormValues,
  recipeSchema,
  stepTime,
  THUMB_MAX_BYTES,
  toRecipeFormData,
} from "./recipeForm.ts";

const photo = new File(["img"], "salad.png", { type: "image/png" });

const validValues: RecipeFormValues = {
  thumb: photo,
  title: "  Salmon avocado salad ",
  description: "A healthy salad",
  categoryId: "cat-1",
  areaId: "area-1",
  time: 40,
  ingredients: [
    { id: "ing-1", measure: " 400 g " },
    { id: "ing-2", measure: "3" },
  ],
  instructions: "Mix everything",
};

const errorsOf = async (values: RecipeFormValues) => {
  try {
    await recipeSchema.validate(values, { abortEarly: false });
    return {};
  } catch (error) {
    if (!(error instanceof ValidationError)) throw error;
    return Object.fromEntries(
      error.inner.map(({ path, message }) => [path, message]),
    );
  }
};

describe("cooking time", () => {
  it("steps by 5 minutes and snaps to multiples of 5", () => {
    expect(stepTime(10, 1)).toBe(15);
    expect(stepTime(10, -1)).toBe(5);
    expect(stepTime(1, 1)).toBe(5);
    expect(stepTime(7, 1)).toBe(10);
    expect(stepTime(7, -1)).toBe(5);
  });

  it("never leaves the 1…1440 range", () => {
    expect(stepTime(5, -1)).toBe(1);
    expect(stepTime(1, -1)).toBe(1);
    expect(stepTime(1440, 1)).toBe(1440);
    expect(stepTime(1438, 1)).toBe(1440);
  });

  it("parses manual input and clamps it", () => {
    expect(parseTimeInput(" 45 ")).toBe(45);
    expect(parseTimeInput("0")).toBe(1);
    expect(parseTimeInput("5000")).toBe(1440);
    expect(parseTimeInput("")).toBeNull();
    expect(parseTimeInput("12.5")).toBeNull();
    expect(parseTimeInput("-3")).toBeNull();
    expect(parseTimeInput("abc")).toBeNull();
  });
});

describe("recipeSchema", () => {
  it("accepts a complete recipe", async () => {
    expect(await errorsOf(validValues)).toEqual({});
  });

  it("requires every field of an empty form", async () => {
    const errors = await errorsOf(initialRecipeValues);
    expect(Object.keys(errors).sort()).toEqual([
      "areaId",
      "categoryId",
      "description",
      "ingredients",
      "instructions",
      "thumb",
      "title",
    ]);
  });

  it("treats whitespace-only text as empty", async () => {
    const errors = await errorsOf({
      ...validValues,
      title: "   ",
      instructions: "\n ",
    });
    expect(errors).toHaveProperty("title");
    expect(errors).toHaveProperty("instructions");
  });

  it("matches the backend title length (3–100 after trim)", async () => {
    expect(await errorsOf({ ...validValues, title: "ab" })).toHaveProperty(
      "title",
    );
    expect(await errorsOf({ ...validValues, title: "  ab  " })).toHaveProperty(
      "title",
    );
    expect(
      await errorsOf({ ...validValues, title: "a".repeat(101) }),
    ).toHaveProperty("title");
    expect(await errorsOf({ ...validValues, title: "abc" })).toEqual({});
    expect(await errorsOf({ ...validValues, title: "a".repeat(100) })).toEqual(
      {},
    );
  });

  it("limits text lengths", async () => {
    const errors = await errorsOf({
      ...validValues,
      description: "a".repeat(201),
      instructions: "a".repeat(1001),
    });
    expect(errors).toHaveProperty("description");
    expect(errors).toHaveProperty("instructions");
    expect(
      await errorsOf({
        ...validValues,
        description: "a".repeat(200),
        instructions: "a".repeat(1000),
      }),
    ).toEqual({});
  });

  it("enforces the cooking time bounds", async () => {
    expect(await errorsOf({ ...validValues, time: 0 })).toHaveProperty("time");
    expect(await errorsOf({ ...validValues, time: 1441 })).toHaveProperty(
      "time",
    );
    expect(await errorsOf({ ...validValues, time: 2.5 })).toHaveProperty(
      "time",
    );
    expect(await errorsOf({ ...validValues, time: 1 })).toEqual({});
    expect(await errorsOf({ ...validValues, time: 1440 })).toEqual({});
  });

  it("checks the photo type and size", async () => {
    const gif = new File(["gif"], "a.gif", { type: "image/gif" });
    expect(await errorsOf({ ...validValues, thumb: gif })).toHaveProperty(
      "thumb",
    );

    const huge = new File([new Uint8Array(THUMB_MAX_BYTES + 1)], "big.jpg", {
      type: "image/jpeg",
    });
    expect(await errorsOf({ ...validValues, thumb: huge })).toHaveProperty(
      "thumb",
    );
  });

  it("rejects duplicate ingredients", async () => {
    const errors = await errorsOf({
      ...validValues,
      ingredients: [
        { id: "ing-1", measure: "1" },
        { id: "ing-1", measure: "2" },
      ],
    });
    expect(errors.ingredients).toBe("Each ingredient can be added only once");
  });
});

describe("toRecipeFormData", () => {
  it("serializes values in the backend format", () => {
    const formData = toRecipeFormData(validValues);

    expect(formData.get("title")).toBe("Salmon avocado salad");
    expect(formData.get("time")).toBe("40");
    expect(formData.get("categoryId")).toBe("cat-1");
    expect(formData.get("areaId")).toBe("area-1");
    expect(JSON.parse(String(formData.get("ingredients")))).toEqual([
      { id: "ing-1", measure: "400 g" },
      { id: "ing-2", measure: "3" },
    ]);
    expect(formData.get("thumb")).toBeInstanceOf(File);
    expect((formData.get("thumb") as File).name).toBe("salad.png");
  });

  it("omits the photo when the existing one stays", () => {
    const formData = toRecipeFormData({ ...validValues, thumb: null });
    expect(formData.get("thumb")).toBeNull();
  });
});

describe("editRecipeSchema", () => {
  it("keeps the current photo when no new file is chosen", async () => {
    await expect(
      editRecipeSchema.validate({ ...validValues, thumb: null }),
    ).resolves.toMatchObject({ title: "Salmon avocado salad" });
  });
});

describe("parseSubmitError", () => {
  const axiosError = (status: number, data: unknown) =>
    new AxiosError("Request failed", "ERR_BAD_REQUEST", undefined, null, {
      status,
      statusText: "",
      headers: {},
      config: { headers: new AxiosHeaders() },
      data,
    });

  it("maps backend validation errors onto form fields", () => {
    const result = parseSubmitError(
      axiosError(400, {
        message: "Validation error",
        errors: [
          { path: "categoryId", message: "Unknown category" },
          { path: "ingredients[1].id", message: "Unknown ingredient" },
          { path: "ingredients.0.measure", message: "Second message" },
          { path: "unknownField", message: "Ignored" },
        ],
      }),
    );

    expect(result).toEqual({
      message: "Validation error",
      fieldErrors: {
        categoryId: "Unknown category",
        ingredients: "Unknown ingredient",
      },
    });
  });

  it("falls back to a generic message", () => {
    expect(parseSubmitError(new Error("Network Error"))).toEqual({
      message: "Unable to publish the recipe. Please try again.",
      fieldErrors: {},
    });
  });
});
