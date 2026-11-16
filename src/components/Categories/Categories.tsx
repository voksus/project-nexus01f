import clsx from "clsx";
import { useState } from "react";
import { Icon } from "../ui/Icon/Icon.tsx";
import { MainTitle } from "../ui/MainTitle/MainTitle.tsx";
import { Subtitle } from "../ui/Subtitle/Subtitle.tsx";
import styles from "./Categories.module.css";
import {
  CATEGORIES,
  COLLAPSED_COUNT,
  COLLAPSED_COUNT_MOBILE,
} from "./Categories.ts";

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
          {visible.map(({ name }, index) => {
            const slug = name.toLowerCase();
            return (
              <li
                key={name}
                className={clsx(
                  styles.card,
                  !isExpanded &&
                    index >= COLLAPSED_COUNT_MOBILE &&
                    styles.hiddenOnMobile,
                )}
              >
                <picture className={styles.picture}>
                  <source
                    type="image/webp"
                    srcSet={`/images/categories/${slug}.webp 1x, /images/categories/${slug}@2x.webp 2x`}
                  />
                  <img
                    className={styles.image}
                    src={`/images/categories/${slug}.png`}
                    srcSet={`/images/categories/${slug}.png 1x, /images/categories/${slug}@2x.png 2x`}
                    alt={name}
                    loading="lazy"
                  />
                </picture>
                <div className={styles.controls}>
                  <span className={styles.name}>{name}</span>
                  <button
                    type="button"
                    className={styles.arrow}
                    aria-label={`Show ${name} recipes`}
                    onClick={() => onSelect(name)}
                  >
                    <Icon name="arrow-up-right" className={styles.arrowIcon} />
                  </button>
                </div>
              </li>
            );
          })}

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
