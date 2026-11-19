import clsx from "clsx";
import { type ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Icon } from "../Icon/Icon.tsx";
import styles from "./Modal.module.css";

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
  className?: string;
}

export const Modal = ({ children, onClose, className }: ModalProps) => {
  const backdropRef = useRef<HTMLDivElement>(null);

  // Закриття по Escape, кліку по backdrop та блокування прокрутки сторінки під модалкою
  useEffect(() => {
    const backdropElement = backdropRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    const handleBackdropClick = (event: MouseEvent) => {
      if (event.target === backdropElement) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    backdropElement?.addEventListener("click", handleBackdropClick);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
      backdropElement?.removeEventListener("click", handleBackdropClick);
    };
  }, [onClose]);

  const portalRoot = document.getElementById("modal-root") ?? document.body;

  return createPortal(
    <div ref={backdropRef} className={styles.backdrop}>
      <div
        className={clsx(styles.modal, className)}
        role="dialog"
        aria-modal="true"
      >
        <button
          type="button"
          className={styles.closeButton}
          aria-label="Close modal"
          onClick={onClose}
        >
          <Icon name="close" className={styles.closeIcon} />
        </button>
        {children}
      </div>
    </div>,
    portalRoot,
  );
};
