import clsx from "clsx";
import { Link } from "react-router-dom";
import styles from "./PathInfo.module.css";

interface PathInfoProps {
  current: string;
  className?: string;
}

export const PathInfo = ({ current, className }: PathInfoProps) => {
  return (
    <nav
      aria-label="Breadcrumb"
      className={clsx(styles.breadcrumbs, className)}
    >
      <Link to="/" className={styles.homeLink}>
        Home
      </Link>
      <span className={styles.separator}>/</span>
      <span className={styles.currentPage}>{current}</span>
    </nav>
  );
};
