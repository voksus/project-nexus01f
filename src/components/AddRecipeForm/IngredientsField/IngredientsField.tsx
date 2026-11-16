import clsx from "clsx";
import { type KeyboardEvent, useMemo, useState } from "react";
import type { Ingredient } from "../../../types/api.ts";
import { Icon } from "../../ui/Icon/Icon.tsx";
import { Select } from "../../ui/Select/Select.tsx";
import type { RecipeIngredientValue } from "../recipeForm.ts";
import styles from "./IngredientsField.module.css";

interface IngredientsFieldProps {
  id: string;
  value: RecipeIngredientValue[];
  onChange: (ingredients: RecipeIngredientValue[]) => void;
  onBlur?: () => void;
  ingredients: Ingredient[];
  ingredientsById: Map<string, Ingredient>;
  disabled?: boolean;
  invalid?: boolean;
  describedBy?: string;
}

export const IngredientsField = ({
  id,
  value,
  onChange,
  onBlur,
  ingredients,
  ingredientsById,
  disabled = false,
  invalid = false,
  describedBy,
}: IngredientsFieldProps) => {
  // Draft stays outside Formik until added
  const [ingredientId, setIngredientId] = useState("");
  const [measure, setMeasure] = useState("");
  const [draftError, setDraftError] = useState<string | null>(null);

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
      setDraftError("Select an ingredient");
      return;
    }
    if (!trimmed) {
      setDraftError("Enter the quantity");
      return;
    }
    if (value.some((item) => item.id === ingredientId)) {
      setDraftError("This ingredient is already added");
      return;
    }
    onChange([...value, { id: ingredientId, measure: trimmed }]);
    setIngredientId("");
    setMeasure("");
    setDraftError(null);
  };

  const remove = (removedId: string) => {
    onChange(value.filter((item) => item.id !== removedId));
    onBlur?.();
  };

  const handleMeasureKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    // Enter adds the ingredient instead of submitting the form
    event.preventDefault();
    add();
  };

  const draftErrorId = `${id}-draft-error`;
  const describedByIds =
    clsx(describedBy, draftError && draftErrorId) || undefined;

  return (
    <div className={styles.root}>
      <div className={styles.draftBlock}>
        <div className={styles.draft}>
          <Select
            id={id}
            className={styles.select}
            options={options}
            value={ingredientId}
            onChange={(next) => {
              setIngredientId(next);
              setDraftError(null);
            }}
            onBlur={onBlur}
            placeholder={
              disabled ? "Loading ingredients…" : "Add the ingredient"
            }
            searchable
            disabled={disabled}
            invalid={invalid || draftError === "Select an ingredient"}
            aria-describedby={describedByIds}
          />
          <input
            type="text"
            className={clsx(
              styles.measure,
              draftError === "Enter the quantity" && styles.measureInvalid,
            )}
            placeholder="Enter quantity"
            aria-label="Quantity"
            aria-describedby={draftError ? draftErrorId : undefined}
            maxLength={50}
            value={measure}
            onChange={(event) => {
              setMeasure(event.target.value);
              setDraftError(null);
            }}
            onKeyDown={handleMeasureKeyDown}
          />
        </div>

        {draftError && (
          <p id={draftErrorId} className={styles.error} role="alert">
            {draftError}
          </p>
        )}
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
