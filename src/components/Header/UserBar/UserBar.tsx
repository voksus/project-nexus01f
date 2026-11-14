import clsx from "clsx";
import { useEffect, useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { UserShort } from "../../../types/api.ts";
import { Icon } from "../../ui/Icon/Icon.tsx";
import styles from "./UserBar.module.css";

interface UserBarProps {
  user: UserShort;
  onLogout: () => void;
}

export const UserBar = ({ user, onLogout }: UserBarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // Закриваємо дропдаун кліком поза ним та клавішею Escape
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target)
      ) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  return (
    <div ref={rootRef} className={styles.root}>
      <button
        ref={toggleRef}
        type="button"
        className={styles.toggle}
        aria-expanded={isOpen}
        aria-controls={menuId}
        onClick={() => setIsOpen((open) => !open)}
      >
        {/* TODO [FE-00]: заглушка avatar.svg (#1) замість літери, коли аватара немає */}
        {user.avatar ? (
          <img className={styles.avatar} src={user.avatar} alt="" />
        ) : (
          <span className={styles.avatar} aria-hidden="true">
            {user.name.charAt(0)}
          </span>
        )}
        <span className={styles.name}>{user.name}</span>
        <Icon
          name="chevron-down"
          className={clsx(styles.chevron, isOpen && styles.chevronOpen)}
        />
      </button>

      <div id={menuId} className={styles.dropdown} hidden={!isOpen}>
        <Link
          to={`/user/${user.id}`}
          className={styles.item}
          onClick={() => setIsOpen(false)}
        >
          Profile
        </Link>
        <button type="button" className={styles.item} onClick={handleLogout}>
          Log out
          <Icon name="arrow-up-right" className={styles.itemIcon} />
        </button>
      </div>
    </div>
  );
};
