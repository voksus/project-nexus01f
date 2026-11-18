import clsx from "clsx";
import {
  type FocusEvent,
  type KeyboardEvent,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { Icon } from "../Icon/Icon.tsx";
import styles from "./Select.module.css";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
  options: SelectOption[];
  /** Empty string means no selection */
  value: string;
  onChange: (value: string) => void;
  /** Fires when focus leaves the component */
  onBlur?: () => void;
  placeholder: string;
  /** Filterable text input instead of a button */
  searchable?: boolean;
  invalid?: boolean;
  disabled?: boolean;
  emptyMessage?: string;
  className?: string;
  "aria-describedby"?: string;
}

export const Select = ({
  id,
  options,
  value,
  onChange,
  onBlur,
  placeholder,
  searchable = false,
  invalid = false,
  disabled = false,
  emptyMessage = "Nothing found",
  className,
  "aria-describedby": describedBy,
}: SelectProps) => {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const listId = `${controlId}-list`;
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(-1);

  const selected = options.find((option) => option.value === value);

  const visibleOptions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return needle
      ? options.filter((option) => option.label.toLowerCase().includes(needle))
      : options;
  }, [options, query]);

  const open = () => {
    if (disabled) return;
    setIsOpen(true);
    setActiveIndex(
      Math.max(
        0,
        options.findIndex((option) => option.value === value),
      ),
    );
  };

  const close = useCallback(() => {
    setIsOpen(false);
    setQuery("");
    setActiveIndex(-1);
  }, []);

  const choose = (option: SelectOption) => {
    onChange(option.value);
    close();
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [isOpen, close]);

  // Keep the active option in view
  useEffect(() => {
    if (!isOpen || activeIndex < 0) return;
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [isOpen, activeIndex]);

  const moveActive = (delta: number) => {
    if (!visibleOptions.length) return;
    setActiveIndex((index) =>
      Math.min(visibleOptions.length - 1, Math.max(0, index + delta)),
    );
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp":
        event.preventDefault();
        if (!isOpen) open();
        else moveActive(event.key === "ArrowDown" ? 1 : -1);
        break;
      case "Home":
      case "End":
        if (!isOpen || searchable) break;
        event.preventDefault();
        setActiveIndex(event.key === "Home" ? 0 : visibleOptions.length - 1);
        break;
      case "Enter":
        // Don't submit the form
        event.preventDefault();
        if (!isOpen) open();
        else if (visibleOptions[activeIndex])
          choose(visibleOptions[activeIndex]);
        break;
      case " ":
        if (searchable) break;
        event.preventDefault();
        if (isOpen && visibleOptions[activeIndex])
          choose(visibleOptions[activeIndex]);
        else open();
        break;
      case "Escape":
        if (!isOpen) break;
        event.preventDefault();
        close();
        break;
      case "Tab":
        if (isOpen) close();
        break;
    }
  };

  // Focus never leaves the control, so blur is handled there
  const handleBlur = (event: FocusEvent<HTMLElement>) => {
    if (rootRef.current?.contains(event.relatedTarget as Node | null)) return;
    close();
    onBlur?.();
  };

  const activeOptionId =
    isOpen && visibleOptions[activeIndex]
      ? `${controlId}-option-${activeIndex}`
      : undefined;

  const comboboxProps = {
    id: controlId,
    role: "combobox",
    "aria-expanded": isOpen,
    "aria-controls": listId,
    "aria-haspopup": "listbox" as const,
    "aria-activedescendant": activeOptionId,
    "aria-invalid": invalid || undefined,
    "aria-describedby": describedBy,
    disabled,
    onKeyDown: handleKeyDown,
    onBlur: handleBlur,
  };

  return (
    <div ref={rootRef} className={clsx(styles.root, className)}>
      <div
        className={clsx(
          styles.control,
          invalid && styles.invalid,
          disabled && styles.disabled,
        )}
      >
        {searchable ? (
          <input
            {...comboboxProps}
            type="text"
            autoComplete="off"
            aria-autocomplete="list"
            className={clsx(styles.field, styles.input)}
            placeholder={selected?.label ?? placeholder}
            value={isOpen ? query : (selected?.label ?? "")}
            onChange={(event) => {
              setQuery(event.target.value);
              setActiveIndex(0);
              if (!isOpen) setIsOpen(true);
            }}
            onClick={() => (isOpen ? undefined : open())}
          />
        ) : (
          <button
            {...comboboxProps}
            type="button"
            className={clsx(styles.field, !selected && styles.placeholder)}
            onClick={() => (isOpen ? close() : open())}
          >
            <span className={styles.label}>
              {selected?.label ?? placeholder}
            </span>
          </button>
        )}
        <Icon
          name="chevron-down"
          className={clsx(styles.chevron, isOpen && styles.chevronOpen)}
        />
      </div>

      {isOpen && (
        // Keep focus on the control when clicking options or the scrollbar
        // biome-ignore lint/a11y/noStaticElementInteractions: only prevents focus loss
        <div
          className={styles.popup}
          onMouseDown={(event) => event.preventDefault()}
        >
          <div ref={listRef} id={listId} role="listbox" className={styles.list}>
            {visibleOptions.length === 0 ? (
              <div className={styles.empty}>{emptyMessage}</div>
            ) : (
              visibleOptions.map((option, index) => (
                // biome-ignore lint/a11y/useKeyWithClickEvents: keyboard is handled on the combobox
                <div
                  key={option.value}
                  id={`${controlId}-option-${index}`}
                  data-index={index}
                  role="option"
                  tabIndex={-1}
                  aria-selected={option.value === value}
                  className={clsx(
                    styles.option,
                    index === activeIndex && styles.active,
                    option.value === value && styles.selected,
                  )}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(option)}
                >
                  {option.label}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
