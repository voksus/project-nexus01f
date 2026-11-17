import axios from "axios";
import clsx from "clsx";
import { type FormikHelpers, useFormik } from "formik";
import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useReferences } from "../../hooks/useReferences.ts";
import { useAppSelector } from "../../redux/hooks.ts";
import { selectIngredientsById } from "../../redux/references/selectors.ts";
import { createRecipe } from "../../services/recipesApi.ts";
import { CountedTextarea } from "../ui/CountedTextarea/CountedTextarea.tsx";
import { Icon } from "../ui/Icon/Icon.tsx";
import { Select } from "../ui/Select/Select.tsx";
import styles from "./AddRecipeForm.module.css";
import { CookingTime } from "./CookingTime/CookingTime.tsx";
import { ImagePicker } from "./ImagePicker/ImagePicker.tsx";
import { IngredientsField } from "./IngredientsField/IngredientsField.tsx";
import {
  DESCRIPTION_MAX,
  INSTRUCTIONS_MAX,
  initialRecipeValues,
  parseSubmitError,
  type RecipeFormValues,
  recipeSchema,
  toRecipeFormData,
} from "./recipeForm.ts";

const errorId = (name: keyof RecipeFormValues) => `recipe-${name}-error`;

interface FieldProps {
  label: string;
  htmlFor?: string;
  labelId?: string;
  error?: string;
  errorFor: keyof RecipeFormValues;
  className?: string;
  children: ReactNode;
}

// Groups without a single control (cooking time) get a span label
const Field = ({
  label,
  htmlFor,
  labelId,
  error,
  errorFor,
  className,
  children,
}: FieldProps) => (
  <div className={clsx(styles.field, className)}>
    {htmlFor ? (
      <label htmlFor={htmlFor} id={labelId} className={styles.label}>
        {label}
      </label>
    ) : (
      <span id={labelId} className={styles.label}>
        {label}
      </span>
    )}
    <div className={styles.control}>
      {children}
      {error && (
        <p id={errorId(errorFor)} className={styles.error}>
          {error}
        </p>
      )}
    </div>
  </div>
);

const toOptions = (items: { id: string; name: string }[]) =>
  items.map(({ id, name }) => ({ value: id, label: name }));

export const AddRecipeForm = () => {
  const navigate = useNavigate();
  const formRef = useRef<HTMLFormElement>(null);
  // Changing the key resets the ingredient draft along with resetForm
  const [draftKey, setDraftKey] = useState(0);

  const categories = useReferences("categories");
  const areas = useReferences("areas");
  const ingredients = useReferences("ingredients");
  const ingredientsById = useAppSelector(selectIngredientsById);

  const categoryOptions = useMemo(
    () => toOptions(categories.items),
    [categories.items],
  );
  const areaOptions = useMemo(() => toOptions(areas.items), [areas.items]);

  const handleSubmit = async (
    values: RecipeFormValues,
    { setErrors }: FormikHelpers<RecipeFormValues>,
  ) => {
    try {
      const recipe = await createRecipe(toRecipeFormData(values));
      toast.success("Your recipe has been published");
      navigate(`/recipe/${recipe.id}`);
    } catch (error) {
      if (axios.isCancel(error)) return;
      const { message, fieldErrors } = parseSubmitError(error);
      setErrors(fieldErrors);
      toast.error(message);
    }
  };

  const formik = useFormik<RecipeFormValues>({
    initialValues: initialRecipeValues,
    validationSchema: recipeSchema,
    onSubmit: handleSubmit,
  });

  const {
    values,
    errors,
    touched,
    submitCount,
    isSubmitting,
    setFieldValue,
    setFieldTouched,
  } = formik;

  const errorOf = (name: keyof RecipeFormValues) => {
    const message = errors[name];
    return (touched[name] || submitCount > 0) && typeof message === "string"
      ? message
      : undefined;
  };

  const describedBy = (name: keyof RecipeFormValues) =>
    errorOf(name) ? errorId(name) : undefined;

  // Smoothly scroll to and focus the first invalid field after a failed submit
  useEffect(() => {
    if (isSubmitting || submitCount === 0) return;
    const field = formRef.current?.querySelector<HTMLElement>(
      '[aria-invalid="true"]',
    );
    if (!field) return;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    // The visually hidden photo input scrolls via its visible wrapper
    const target =
      field.offsetWidth > 1 ? field : (field.parentElement ?? field);
    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "center",
    });
    field.focus({ preventScroll: true });
  }, [isSubmitting, submitCount]);

  const handleClear = () => {
    formik.resetForm();
    setDraftKey((key) => key + 1);
  };

  const referenceError = [categories, areas, ingredients].some(
    (list) => list.status === "failed",
  );

  return (
    <form
      ref={formRef}
      className={styles.form}
      onSubmit={formik.handleSubmit}
      noValidate
    >
      <div className={styles.photo}>
        <ImagePicker
          id="recipe-thumb"
          value={values.thumb}
          onChange={(file) => {
            void setFieldValue("thumb", file);
            void setFieldTouched("thumb", true, false);
          }}
          invalid={Boolean(errorOf("thumb"))}
          describedBy={describedBy("thumb")}
        />
        {errorOf("thumb") && (
          <p id={errorId("thumb")} className={styles.error}>
            {errorOf("thumb")}
          </p>
        )}
      </div>

      <div className={styles.fields}>
        <div className={styles.main}>
          <div className={styles.name}>
            <div className={styles.control}>
              <input
                type="text"
                className={clsx(
                  styles.title,
                  errorOf("title") && styles.titleInvalid,
                )}
                placeholder="The name of the recipe"
                aria-label="Recipe name"
                aria-invalid={Boolean(errorOf("title")) || undefined}
                aria-describedby={describedBy("title")}
                {...formik.getFieldProps("title")}
              />
              {errorOf("title") && (
                <p id={errorId("title")} className={styles.error}>
                  {errorOf("title")}
                </p>
              )}
            </div>

            <div className={styles.control}>
              <CountedTextarea
                placeholder="Enter a description of the dish"
                aria-label="Recipe description"
                maxLength={DESCRIPTION_MAX}
                invalid={Boolean(errorOf("description"))}
                aria-describedby={describedBy("description")}
                {...formik.getFieldProps("description")}
              />
              {errorOf("description") && (
                <p id={errorId("description")} className={styles.error}>
                  {errorOf("description")}
                </p>
              )}
            </div>
          </div>

          <div className={styles.group}>
            <div className={styles.row}>
              <Field
                label="Category"
                htmlFor="recipe-category"
                error={errorOf("categoryId")}
                errorFor="categoryId"
                className={styles.selectField}
              >
                <Select
                  id="recipe-category"
                  options={categoryOptions}
                  value={values.categoryId}
                  onChange={(id) => void setFieldValue("categoryId", id)}
                  onBlur={() => void setFieldTouched("categoryId", true)}
                  placeholder={
                    categories.status === "succeeded"
                      ? "Select a category"
                      : "Loading…"
                  }
                  disabled={categories.status !== "succeeded"}
                  invalid={Boolean(errorOf("categoryId"))}
                  aria-describedby={describedBy("categoryId")}
                />
              </Field>

              <Field
                label="Cooking time"
                labelId="recipe-time-label"
                error={errorOf("time")}
                errorFor="time"
              >
                <CookingTime
                  id="recipe-time"
                  labelledBy="recipe-time-label"
                  value={values.time}
                  onChange={(minutes) => void setFieldValue("time", minutes)}
                  onBlur={() => void setFieldTouched("time", true)}
                  isPristine={!touched.time}
                  invalid={Boolean(errorOf("time"))}
                  describedBy={describedBy("time")}
                />
              </Field>
            </div>

            <Field
              label="Area"
              htmlFor="recipe-area"
              error={errorOf("areaId")}
              errorFor="areaId"
              className={styles.selectField}
            >
              <Select
                id="recipe-area"
                options={areaOptions}
                value={values.areaId}
                onChange={(id) => void setFieldValue("areaId", id)}
                onBlur={() => void setFieldTouched("areaId", true)}
                placeholder={areas.status === "succeeded" ? "Area" : "Loading…"}
                disabled={areas.status !== "succeeded"}
                invalid={Boolean(errorOf("areaId"))}
                aria-describedby={describedBy("areaId")}
              />
            </Field>

            <Field
              label="Ingredients"
              htmlFor="recipe-ingredient"
              error={errorOf("ingredients")}
              errorFor="ingredients"
            >
              <IngredientsField
                key={draftKey}
                id="recipe-ingredient"
                value={values.ingredients}
                onChange={(list) => void setFieldValue("ingredients", list)}
                ingredients={ingredients.items}
                ingredientsById={ingredientsById}
                disabled={ingredients.status !== "succeeded"}
                invalid={Boolean(errorOf("ingredients"))}
                describedBy={describedBy("ingredients")}
              />
            </Field>
          </div>

          {referenceError && (
            <p className={styles.notice} role="alert">
              Some lists failed to load.{" "}
              <button
                type="button"
                className={styles.retry}
                onClick={() => {
                  categories.retry();
                  areas.retry();
                  ingredients.retry();
                }}
              >
                Try again
              </button>
            </p>
          )}
        </div>

        <Field
          label="Recipe preparation"
          htmlFor="recipe-instructions"
          error={errorOf("instructions")}
          errorFor="instructions"
          className={styles.preparation}
        >
          <CountedTextarea
            id="recipe-instructions"
            placeholder="Enter recipe"
            maxLength={INSTRUCTIONS_MAX}
            invalid={Boolean(errorOf("instructions"))}
            aria-describedby={describedBy("instructions")}
            {...formik.getFieldProps("instructions")}
          />
        </Field>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.clear}
            aria-label="Clear the form"
            onClick={handleClear}
            disabled={isSubmitting}
          >
            <Icon name="trash" className={styles.clearIcon} />
          </button>
          <button
            type="submit"
            className={styles.publish}
            disabled={isSubmitting}
            aria-busy={isSubmitting || undefined}
          >
            {isSubmitting ? "Publishing…" : "Publish"}
          </button>
        </div>
      </div>
    </form>
  );
};
