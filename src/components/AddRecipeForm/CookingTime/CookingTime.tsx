import clsx from "clsx";
import { type KeyboardEvent, useState } from "react";
import { Icon } from "../../ui/Icon/Icon.tsx";
import {
  parseTimeInput,
  stepTime,
  TIME_MAX,
  TIME_MIN,
  TIME_STEP,
} from "../recipeForm.ts";
import styles from "./CookingTime.module.css";

interface CookingTimeProps {
  id: string;
  value: number;
  onChange: (minutes: number) => void;
  onBlur?: () => void;
  /** Untouched default is gray in the mockup */
  isPristine?: boolean;
  invalid?: boolean;
  describedBy?: string;
  /** Id of the visible "Cooking time" label */
  labelledBy?: string;
}

export const CookingTime = ({
  id,
  value,
  onChange,
  onBlur,
  isPristine = false,
  invalid = false,
  describedBy,
  labelledBy,
}: CookingTimeProps) => {
  const [draft, setDraft] = useState<string | null>(null);
  const isEditing = draft !== null;

  const commit = () => {
    if (draft === null) return;
    const minutes = parseTimeInput(draft);
    if (minutes !== null) onChange(minutes);
    setDraft(null);
    onBlur?.();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      // Enter commits the value instead of submitting the form
      event.preventDefault();
      commit();
    } else if (event.key === "Escape") {
      event.preventDefault();
      setDraft(null);
    }
  };

  return (
    <fieldset className={styles.root} aria-labelledby={labelledBy}>
      <button
        type="button"
        className={styles.step}
        aria-label={`Decrease cooking time by ${TIME_STEP} minutes`}
        // aria-disabled keeps keyboard focus at the limits
        aria-disabled={value <= TIME_MIN}
        onClick={() => {
          if (value <= TIME_MIN) return;
          onChange(stepTime(value, -1));
          onBlur?.();
        }}
      >
        <Icon name="minus" className={styles.icon} />
      </button>

      {isEditing ? (
        <input
          id={id}
          className={clsx(
            styles.value,
            styles.input,
            invalid && styles.invalid,
          )}
          type="text"
          inputMode="numeric"
          aria-label={`Cooking time in minutes, from ${TIME_MIN} to ${TIME_MAX}`}
          aria-describedby={describedBy}
          aria-invalid={invalid || undefined}
          // biome-ignore lint/a11y/noAutofocus: shown only after an explicit click
          autoFocus
          value={draft}
          maxLength={4}
          onFocus={(event) => event.target.select()}
          onChange={(event) => setDraft(event.target.value.replace(/\D/g, ""))}
          onKeyDown={handleKeyDown}
          onBlur={commit}
        />
      ) : (
        <button
          id={id}
          type="button"
          className={clsx(
            styles.value,
            isPristine && styles.pristine,
            invalid && styles.invalid,
          )}
          aria-label={`Cooking time: ${value} minutes. Click to enter manually`}
          aria-describedby={describedBy}
          onClick={() => setDraft(String(value))}
        >
          {value} min
        </button>
      )}

      <button
        type="button"
        className={styles.step}
        aria-label={`Increase cooking time by ${TIME_STEP} minutes`}
        aria-disabled={value >= TIME_MAX}
        onClick={() => {
          if (value >= TIME_MAX) return;
          onChange(stepTime(value, 1));
          onBlur?.();
        }}
      >
        <Icon name="plus" className={styles.icon} />
      </button>
    </fieldset>
  );
};
