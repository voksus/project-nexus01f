import clsx from "clsx";
import { useEffect, useRef } from "react";
import { Icon } from "../../ui/Icon/Icon.tsx";
import { Logo } from "../../ui/Logo/Logo.tsx";
import { Nav } from "../Nav/Nav.tsx";
import styles from "./MobileMenu.module.css";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const TABLET_MEDIA = "(min-width: 768px)";

export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    closeRef.current?.focus();
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    // Меню існує лише на mobile: при розширенні вікна закриваємо, щоб не лишився заблокований скрол
    const tablet = window.matchMedia(TABLET_MEDIA);
    const handleMediaChange = () => {
      if (tablet.matches) onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    tablet.addEventListener("change", handleMediaChange);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
      tablet.removeEventListener("change", handleMediaChange);
    };
  }, [isOpen, onClose]);

  return (
    <div
      className={clsx(styles.menu, isOpen && styles.open)}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      inert={!isOpen}
    >
      <div className={styles.top}>
        <Logo onClick={onClose} />
        <button
          ref={closeRef}
          type="button"
          className={styles.close}
          aria-label="Close menu"
          onClick={onClose}
        >
          <Icon name="close" className={styles.closeIcon} />
        </button>
      </div>

      <div className={styles.nav}>
        <Nav variant="menu" onNavigate={onClose} />
      </div>

      {/* TODO [FE-00]: фото страв (hero-*-mobile з #1) внизу меню, як у Figma */}
    </div>
  );
};
