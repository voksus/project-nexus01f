import clsx from "clsx";
import { NavLink } from "react-router-dom";
import styles from "./Nav.module.css";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/recipe/add", label: "Add recipe" },
];

interface NavProps {
  /** `header` — рядок у Header (tablet/desktop), `menu` — колонка в мобільному меню */
  variant: "header" | "menu";
  onNavigate?: () => void;
}

export const Nav = ({ variant, onNavigate }: NavProps) => {
  return (
    <nav aria-label="Main">
      <ul className={clsx(styles.list, styles[variant])}>
        {LINKS.map(({ to, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              end
              className={({ isActive }) =>
                clsx(styles.link, isActive && styles.active)
              }
              onClick={onNavigate}
            >
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};
