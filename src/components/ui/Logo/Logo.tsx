import clsx from "clsx";
import { Link } from "react-router-dom";
import styles from "./Logo.module.css";

interface LogoProps {
  className?: string;
  onClick?: () => void;
}

/** Колір успадковується від батька: білий у темному Header і меню, чорний у світлому та Footer */
export const Logo = ({ className, onClick }: LogoProps) => {
  return (
    <Link to="/" className={clsx(styles.logo, className)} onClick={onClick}>
      foodies
    </Link>
  );
};
