import clsx from "clsx";
import styles from "./Loader.module.css";

interface LoaderProps {
  className?: string;
}

export const Loader = ({ className }: LoaderProps) => {
  return (
    <div
      className={clsx(styles.wrapper, className)}
      role="status"
      aria-label="Loading"
    >
      <span className={styles.spinner} />
    </div>
  );
};
