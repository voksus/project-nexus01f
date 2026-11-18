import clsx from "clsx";
import {
  type TextareaHTMLAttributes,
  useEffect,
  useLayoutEffect,
  useRef,
} from "react";
import styles from "./CountedTextarea.module.css";

interface CountedTextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value"> {
  value: string;
  maxLength: number;
  invalid?: boolean;
}

// Reset first so the field can shrink
const fitHeight = (textarea: HTMLTextAreaElement) => {
  textarea.style.height = "auto";
  textarea.style.height = `${textarea.scrollHeight}px`;
};

/** Underlined textarea with a live "N/max" counter and auto height */
export const CountedTextarea = ({
  value,
  maxLength,
  invalid = false,
  className,
  ...props
}: CountedTextareaProps) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  // biome-ignore lint/correctness/useExhaustiveDependencies: value triggers the resize
  useLayoutEffect(() => {
    if (ref.current) fitHeight(ref.current);
  }, [value]);

  // Width changes alter the line count; own height changes are ignored
  useEffect(() => {
    const textarea = ref.current;
    if (!textarea || typeof ResizeObserver === "undefined") return;
    let width = textarea.clientWidth;
    const observer = new ResizeObserver(() => {
      if (textarea.clientWidth === width) return;
      width = textarea.clientWidth;
      fitHeight(textarea);
    });
    observer.observe(textarea);
    return () => observer.disconnect();
  }, []);

  return (
    <div className={clsx(styles.wrapper, invalid && styles.invalid, className)}>
      <textarea
        {...props}
        ref={ref}
        rows={1}
        value={value}
        maxLength={maxLength}
        aria-invalid={invalid || undefined}
        className={styles.textarea}
      />
      <span className={styles.counter} aria-hidden="true">
        <span className={clsx(value.length > 0 && styles.count)}>
          {value.length}
        </span>
        /{maxLength}
      </span>
    </div>
  );
};
