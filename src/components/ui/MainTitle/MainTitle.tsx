import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./MainTitle.module.css";

interface MainTitleProps {
  children: ReactNode;
  as?: "h1" | "h2";
  className?: string;
}

export const MainTitle = ({
  children,
  as: Tag = "h2",
  className,
}: MainTitleProps) => {
  return <Tag className={clsx(styles.title, className)}>{children}</Tag>;
};
