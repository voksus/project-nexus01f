import clsx from "clsx";
import { useState } from "react";
import { MainTitle } from "../ui/MainTitle/MainTitle.tsx";
import { Subtitle } from "../ui/Subtitle/Subtitle.tsx";
import styles from "./Categories.module.css";
import {
  CATEGORIES,
  COLLAPSED_COUNT,
  COLLAPSED_COUNT_MOBILE,
} from "./categories.ts";

// TODO [FE-00]: замінити на іконку arrow-up-right зі спрайту icons.svg, коли він з'явиться
const ArrowIcon = () => (
  <svg
    className={styles.arrowIcon}
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="m5.25 12.75 7.5-7.5m-7.5 0h7.5v7.5" />
  </svg>
);

interface CategoriesProps {
  /** Назва категорії з БД */
  onSelect: (category: string) => void;
}

export const Categories = ({ onSelect }: CategoriesProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const visible = isExpanded
    ? CATEGORIES
    : CATEGORIES.slice(0, COLLAPSED_COUNT);

  return (
    <section aria-label="Categories">
      <div className={clsx("container", styles.content)}>
        <div className={styles.heading}>
          <MainTitle>Categories</MainTitle>
          <Subtitle className={styles.subtitle}>
            Discover a limitless world of culinary possibilities and enjoy
            exquisite recipes that combine taste, style and the warm atmosphere
            of the kitchen.
          </Subtitle>
        </div>

        <ul className={styles.list}>
          {visible.map(({ name, label = name }, index) => (
            <li
              key={name}
              className={clsx(
                styles.card,
                !isExpanded &&
                  index >= COLLAPSED_COUNT_MOBILE &&
                  styles.hiddenOnMobile,
              )}
            >
              {/* TODO [FE-00]: фото категорії, коли Serhii додасть зображення 1x/2x */}
              <div className={styles.controls}>
                <span className={styles.name}>{label}</span>
                <button
                  type="button"
                  className={styles.arrow}
                  aria-label={`Show ${label} recipes`}
                  onClick={() => onSelect(name)}
                >
                  <ArrowIcon />
                </button>
              </div>
            </li>
          ))}

          {/* Рішення команди #14: «All categories» довантажує решту категорій і після цього зникає */}
          {!isExpanded && (
            <li className={clsx(styles.card, styles.cardAll)}>
              <button
                type="button"
                className={styles.allButton}
                onClick={() => setIsExpanded(true)}
              >
                All categories
              </button>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
};
