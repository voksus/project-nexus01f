import styles from "./ProfilePagination.module.css";
import { visiblePages } from "./profileTab.ts";

interface ProfilePaginationProps {
  page: number;
  totalPages: number;
  spacing?: "default" | "recipes" | "people";
  onSelect: (page: number) => void;
}

export const ProfilePagination = ({
  page,
  totalPages,
  spacing = "default",
  onSelect,
}: ProfilePaginationProps) => {
  const pages = visiblePages(page, totalPages);
  if (pages.length === 0) return null;

  return (
    <nav
      className={
        spacing === "recipes"
          ? styles.recipePager
          : spacing === "people"
            ? styles.peoplePager
            : styles.pager
      }
      aria-label="Pagination"
    >
      {pages.map((marker, index) => {
        if (marker === "gap") {
          const previous = pages[index - 1];
          return (
            <span
              key={`gap-after-${previous ?? "start"}`}
              className={styles.gap}
              aria-hidden="true"
            >
              …
            </span>
          );
        }
        if (marker === page) {
          return (
            <span key={marker} className={styles.current} aria-current="page">
              {marker}
            </span>
          );
        }
        return (
          <button
            key={marker}
            type="button"
            className={styles.page}
            onClick={() => onSelect(marker)}
          >
            {marker}
          </button>
        );
      })}
    </nav>
  );
};
