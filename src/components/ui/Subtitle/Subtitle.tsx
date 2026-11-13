import clsx from "clsx";
import type { ReactNode } from "react";
import styles from "./Subtitle.module.css";

interface SubtitleProps {
  children: ReactNode;
  className?: string;
}

export const Subtitle = ({ children, className }: SubtitleProps) => {
  return <p className={clsx(styles.subtitle, className)}>{children}</p>;
};
