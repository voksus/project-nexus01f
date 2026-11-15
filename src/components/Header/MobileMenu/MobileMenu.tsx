import clsx from "clsx";
import { useEffect, useRef } from "react";
import heroMainMobilePng2x from "../../../assets/images/hero/hero-main-mobile@2x.png";
import heroMainMobileWebp2x from "../../../assets/images/hero/hero-main-mobile@2x.webp";
import heroMainMobilePng from "../../../assets/images/hero/hero-main-mobile.png";
import heroMainMobileWebp from "../../../assets/images/hero/hero-main-mobile.webp";
import heroSmallMobilePng2x from "../../../assets/images/hero/hero-small-mobile@2x.png";
import heroSmallMobileWebp2x from "../../../assets/images/hero/hero-small-mobile@2x.webp";
import heroSmallMobilePng from "../../../assets/images/hero/hero-small-mobile.png";
import heroSmallMobileWebp from "../../../assets/images/hero/hero-small-mobile.webp";
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

      {/* Декоративні фото страв, як у Hero: поворот і скруглення вже є в самих зображеннях */}
      <div className={styles.images} aria-hidden="true">
        <picture className={styles.imageSmall}>
          <source
            type="image/webp"
            srcSet={`${heroSmallMobileWebp} 1x, ${heroSmallMobileWebp2x} 2x`}
          />
          <img
            src={heroSmallMobilePng}
            srcSet={`${heroSmallMobilePng} 1x, ${heroSmallMobilePng2x} 2x`}
            width={89}
            height={84}
            alt=""
          />
        </picture>
        <picture className={styles.imageMain}>
          <source
            type="image/webp"
            srcSet={`${heroMainMobileWebp} 1x, ${heroMainMobileWebp2x} 2x`}
          />
          <img
            src={heroMainMobilePng}
            srcSet={`${heroMainMobilePng} 1x, ${heroMainMobilePng2x} 2x`}
            width={222}
            height={208}
            alt=""
          />
        </picture>
      </div>
    </div>
  );
};
