import clsx from "clsx";
import { type KeyboardEvent, useMemo, useRef, useState } from "react";
import type { Ingredient } from "../../../types/api.ts";
import { Icon } from "../../ui/Icon/Icon.tsx";
import { Select } from "../../ui/Select/Select.tsx";
import type { RecipeIngredientValue } from "../recipeForm.ts";
import styles from "./IngredientsField.module.css";

interface DraftError {
  field: "ingredient" | "measure";
  message: string;
}

const INGREDIENT_REQUIRED: DraftError = {
  field: "ingredient",
  message: "Select an ingredient",
};
const MEASURE_REQUIRED: DraftError = {
  field: "measure",
  message: "Enter the quantity",
};

interface IngredientsFieldProps {
  id: string;
  value: RecipeIngredientValue[];
  onChange: (ingredients: RecipeIngredientValue[]) => void;
  ingredients: Ingredient[];
  ingredientsById: Map<string, Ingredient>;
  disabled?: boolean;
  /** Form-level error after Publish: marks an empty select, the text is shown under the block */
  invalid?: boolean;
  describedBy?: string;
}

export const IngredientsField = ({
  id,
  value,
  onChange,
  ingredients,
  ingredientsById,
  disabled = false,
  invalid = false,
  describedBy,
}: IngredientsFieldProps) => {
  // Draft stays outside Formik until added
  const [ingredientId, setIngredientId] = useState("");
  const [measure, setMeasure] = useState("");
  const [draftError, setDraftError] = useState<DraftError | null>(null);
  const measureRef = useRef<HTMLInputElement>(null);

  // Added ingredients are hidden from the options
  const options = useMemo(() => {
    const added = new Set(value.map((item) => item.id));
    return ingredients
      .filter((item) => !added.has(item.id))
      .map((item) => ({ value: item.id, label: item.name }));
  }, [ingredients, value]);

  const add = () => {
    const trimmed = measure.trim();
    if (!ingredientId) {
      setDraftError(INGREDIENT_REQUIRED);
      document.getElementById(id)?.focus();
      return;
    }
    if (value.some((item) => item.id === ingredientId)) {
      setDraftError({
        field: "ingredient",
        message: "This ingredient is already added",
      });
      return;
    }
    if (!trimmed) {
      setDraftError(MEASURE_REQUIRED);
      measureRef.current?.focus();
      return;
    }
    onChange([...value, { id: ingredientId, measure: trimmed }]);
    setIngredientId("");
    setMeasure("");
    setDraftError(null);
  };

  const remove = (removedId: string) => {
    onChange(value.filter((item) => item.id !== removedId));
  };

  // Empty select is flagged while nothing is added yet or a quantity waits for it
  const handleSelectBlur = () => {
    if (!ingredientId && (measure.trim() || value.length === 0)) {
      setDraftError(INGREDIENT_REQUIRED);
    }
  };

  const handleMeasureBlur = () => {
    if (ingredientId && !measure.trim()) setDraftError(MEASURE_REQUIRED);
  };

  const clearErrorOf = (field: DraftError["field"]) =>
    setDraftError((error) => (error?.field === field ? null : error));

  const handleMeasureKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    // Enter adds the ingredient instead of submitting the form
    event.preventDefault();
    add();
  };

  const ingredientErrorId = `${id}-ingredient-error`;
  const measureErrorId = `${id}-measure-error`;
  const ingredientError =
    draftError?.field === "ingredient" ? draftError.message : null;
  const measureError =
    draftError?.field === "measure" ? draftError.message : null;

  return (
    <div className={styles.root}>
      <div className={styles.draft}>
        <div className={styles.slot}>
          <Select
            id={id}
            options={options}
            value={ingredientId}
            onChange={(next) => {
              setIngredientId(next);
              clearErrorOf("ingredient");
            }}
            onBlur={handleSelectBlur}
            placeholder={
              disabled ? "Loading ingredients…" : "Add the ingredient"
            }
            searchable
            disabled={disabled}
            invalid={Boolean(ingredientError) || (invalid && !ingredientId)}
            aria-describedby={
              clsx(
                ingredientError && ingredientErrorId,
                invalid && describedBy,
              ) || undefined
            }
          />
          {ingredientError && (
            <p id={ingredientErrorId} className={styles.error} role="alert">
              {ingredientError}
            </p>
          )}
        </div>

        <div className={styles.slot}>
          <input
            ref={measureRef}
            type="text"
            className={clsx(
              styles.measure,
              measureError && styles.measureInvalid,
            )}
            placeholder="Enter quantity"
            aria-label="Quantity"
            aria-invalid={Boolean(measureError) || undefined}
            aria-describedby={measureError ? measureErrorId : undefined}
            maxLength={50}
            value={measure}
            onChange={(event) => {
              setMeasure(event.target.value);
              clearErrorOf("measure");
            }}
            onBlur={handleMeasureBlur}
            onKeyDown={handleMeasureKeyDown}
          />
          {measureError && (
            <p id={measureErrorId} className={styles.error} role="alert">
              {measureError}
            </p>
          )}
        </div>
      </div>

      <button
        type="button"
        className={styles.addButton}
        onClick={add}
        disabled={disabled}
      >
        Add ingredient
        <Icon name="plus" className={styles.addIcon} />
      </button>

      {value.length > 0 && (
        <ul className={styles.cards} aria-label="Added ingredients">
          {value.map((item) => {
            const ingredient = ingredientsById.get(item.id);
            const name = ingredient?.name ?? "Unknown ingredient";
            return (
              <li key={item.id} className={styles.card}>
                <div className={styles.thumb}>
                  <img
                    src={
                      ingredient?.img || "/images/placeholders/ingredient.svg"
                    }
                    alt=""
                    className={styles.image}
                    loading="lazy"
                  />
                </div>
                <div className={styles.text}>
                  <p className={styles.name}>{name}</p>
                  <p className={styles.amount}>{item.measure}</p>
                </div>
                <button
                  type="button"
                  className={styles.remove}
                  aria-label={`Remove ${name}`}
                  onClick={() => remove(item.id)}
                >
                  <Icon name="close" className={styles.removeIcon} />
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};
