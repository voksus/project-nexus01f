import clsx from "clsx";
import styles from "./Pagination.module.css";

type PageItem = number | "start-ellipsis" | "end-ellipsis";

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  className?: string;
}

const MAX_VISIBLE_PAGES = 7;

const getPageItems = (page: number, totalPages: number): PageItem[] => {
  if (totalPages <= MAX_VISIBLE_PAGES) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (page <= 3) {
    return [1, 2, 3, 4, 5, "end-ellipsis", totalPages];
  }

  if (page >= totalPages - 2) {
    return [
      1,
      "start-ellipsis",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "start-ellipsis",
    page - 1,
    page,
    page + 1,
    "end-ellipsis",
    totalPages,
  ];
};

export const Pagination = ({
  page,
  totalPages,
  onChange,
  className,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="Pagination" className={clsx(styles.pagination, className)}>
      <ul className={styles.list}>
        {getPageItems(page, totalPages).map((item) => (
          <li key={item}>
            {typeof item === "number" ? (
              <button
                type="button"
                className={clsx(styles.button, item === page && styles.active)}
                aria-label={`Page ${item}`}
                aria-current={item === page ? "page" : undefined}
                onClick={() => item !== page && onChange(item)}
              >
                {item}
              </button>
            ) : (
              <span className={styles.ellipsis} aria-hidden="true">
                …
              </span>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
};
